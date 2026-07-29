import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HAIRLAB_SERVER_BASE_URL } from '../../../core/config/api.config';
import { CustomerAiConsent } from '../../../models/ai-consent';
import { CustomerPhoto } from '../../../models/customer-photo';
import {
  CustomerPhotoAnalysis,
  CustomerPhotoAnalysisAudit,
  PhotoAnalysisApplyMode,
  PhotoAnalysisField,
  PhotoAnalysisFieldDecision,
  PhotoAnalysisProviderAvailability,
  PhotoAnalysisProviderType,
  PhotoAnalysisType,
} from '../../../models/photo-analysis';
import { AiConsentService } from '../../../service/ai-consent-service';
import { CustomerPhotoService } from '../../../service/customer-photo-service';
import { PhotoAnalysisService } from '../../../service/photo-analysis-service';
import { ToastService } from '../../../shared/ui/toast.service';

/**
 * Analisi fotografica assistita.
 *
 * L'IA propone una bozza; l'operatore conserva sempre il controllo dei profili ufficiali.
 */
@Component({
  selector: 'app-customer-photo-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-photo-analysis.html',
  styleUrl: './customer-photo-analysis.css',
})
export class CustomerPhotoAnalysisComponent implements OnChanges {
  private readonly service = inject(PhotoAnalysisService);
  private readonly photoService = inject(CustomerPhotoService);
  private readonly consentService = inject(AiConsentService);
  private readonly toast = inject(ToastService);

  @Input({ required: true }) customerId!: number;

  protected readonly providers = signal<PhotoAnalysisProviderAvailability[]>([]);
  protected readonly analyses = signal<CustomerPhotoAnalysis[]>([]);
  protected readonly selectedAnalysis = signal<CustomerPhotoAnalysis | null>(null);
  protected readonly sourcePhoto = signal<CustomerPhoto | null>(null);
  protected readonly consent = signal<CustomerAiConsent | null>(null);
  protected readonly audit = signal<CustomerPhotoAnalysisAudit[]>([]);
  protected readonly loading = signal(false);
  protected readonly analyzing = signal(false);
  protected readonly saving = signal(false);

  protected provider: PhotoAnalysisProviderType = 'OLLAMA_VISION';
  protected analysisType: PhotoAnalysisType = 'COMPLETE';
  protected applyMode: PhotoAnalysisApplyMode = 'SELECTED_FIELDS';
  protected allowLowQualityOverride = false;
  protected consentVersion = 'HAIRLAB-AI-1.0';
  protected consentNotes = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId) this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    forkJoin({
      providers: this.service.providers(),
      analyses: this.service.findByCustomer(this.customerId),
      source: this.photoService.resolveSource(this.customerId),
      consent: this.consentService.current(this.customerId),
      audit: this.service.auditByCustomer(this.customerId),
    }).subscribe({
      next: ({ providers, analyses, source, consent, audit }) => {
        this.providers.set(providers);
        this.analyses.set(analyses);
        this.sourcePhoto.set(source);
        this.consent.set(consent);
        this.audit.set(audit);
        const current = this.selectedAnalysis();
        this.selectedAnalysis.set(
          current
            ? (analyses.find((item) => item.id === current.id) ?? analyses[0] ?? null)
            : (analyses[0] ?? null),
        );
        if (!this.providerAvailable(this.provider)) {
          this.provider =
            providers.find((item) => item.available && !item.paid)?.provider ??
            providers.find((item) => item.available)?.provider ??
            'MOCK';
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(
          'Analisi IA non disponibile',
          error?.error?.message ?? 'Impossibile caricare il modulo.',
        );
      },
    });
  }

  protected grantConsent(): void {
    if (!this.consentVersion.trim()) {
      this.toast.warning('Versione obbligatoria', 'Indica la versione dell’informativa.');
      return;
    }
    this.consentService
      .grant(this.customerId, {
        confirmed: true,
        documentVersion: this.consentVersion.trim(),
        notes: this.consentNotes.trim() || null,
      })
      .subscribe({
        next: (consent) => {
          this.consent.set(consent);
          this.toast.success('Consenso registrato', 'Ora è possibile avviare analisi manuali.');
          this.reload();
        },
        error: (error) =>
          this.toast.error('Consenso non registrato', error?.error?.message ?? 'Riprova.'),
      });
  }

  protected analyze(): void {
    if (!this.sourcePhoto()) {
      this.toast.warning(
        'Foto necessaria',
        'Aggiungi una foto profilo oppure seleziona una foto nella galleria.',
      );
      return;
    }
    if (!this.consent()?.valid) {
      this.toast.warning(
        'Consenso necessario',
        'Registra il consenso prima di elaborare la fotografia.',
      );
      return;
    }
    const selectedProvider = this.providers().find((item) => item.provider === this.provider);
    if (!selectedProvider?.available) {
      this.toast.warning('Provider non disponibile', selectedProvider?.message ?? 'Riprova.');
      return;
    }
    const cost =
      selectedProvider.paid && selectedProvider.estimatedCostUsd != null
        ? ` Costo stimato: $${selectedProvider.estimatedCostUsd.toFixed(4)}.`
        : '';
    if (
      !confirm(
        `Avviare manualmente l’analisi ${this.analysisType} con ${this.provider}?${cost}\n\nIl risultato sarà soltanto una bozza modificabile.`,
      )
    ) {
      return;
    }

    this.analyzing.set(true);
    this.service
      .create(this.customerId, {
        sourcePhotoId: this.sourcePhoto()?.id ?? null,
        analysisType: this.analysisType,
        provider: this.provider,
        confirmed: true,
      })
      .subscribe({
        next: (analysis) => {
          this.analyzing.set(false);
          this.selectedAnalysis.set(analysis);
          this.toast.success(
            'Bozza IA creata',
            'Controlla e modifica ogni campo prima di applicarlo.',
          );
          this.reload();
        },
        error: (error) => {
          this.analyzing.set(false);
          this.toast.error('Analisi non riuscita', error?.error?.message ?? 'Riprova.');
        },
      });
  }

  protected saveReview(applyNow: boolean): void {
    const analysis = this.selectedAnalysis();
    if (!analysis) return;
    if (
      applyNow &&
      !confirm('Applicare ai profili ufficiali soltanto i campi accettati o modificati?')
    ) {
      return;
    }
    this.saving.set(true);
    this.service
      .review(analysis.id, {
        fields: analysis.fields.map((field) => ({
          section: field.section,
          fieldName: field.fieldName,
          editedValue: field.editedValue ?? null,
          decision: field.decision,
        })),
        applyMode: this.applyMode,
        applyNow,
        allowLowQualityOverride: this.allowLowQualityOverride,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.selectedAnalysis.set(updated);
          this.toast.success(
            applyNow ? 'Profili aggiornati' : 'Revisione salvata',
            applyNow
              ? 'Sono stati applicati soltanto i campi approvati.'
              : 'La bozza resta modificabile.',
          );
          this.reload();
        },
        error: (error) => {
          this.saving.set(false);
          this.toast.error('Operazione non riuscita', error?.error?.message ?? 'Riprova.');
        },
      });
  }

  protected rejectAnalysis(): void {
    const analysis = this.selectedAnalysis();
    if (!analysis || !confirm('Rifiutare questa bozza IA senza modificare i profili?')) return;
    this.service.reject(analysis.id).subscribe({
      next: (updated) => {
        this.selectedAnalysis.set(updated);
        this.toast.success('Bozza rifiutata', 'I profili ufficiali non sono stati modificati.');
        this.reload();
      },
      error: (error) =>
        this.toast.error('Operazione non riuscita', error?.error?.message ?? 'Riprova.'),
    });
  }

  protected selectAnalysis(analysis: CustomerPhotoAnalysis): void {
    this.selectedAnalysis.set(analysis);
  }

  protected acceptReliable(): void {
    const analysis = this.selectedAnalysis();
    if (!analysis) return;
    for (const field of analysis.fields) {
      if (field.proposedValue && (field.confidence ?? 0) >= 60) {
        field.decision = 'ACCEPTED';
        field.editedValue = null;
      }
    }
  }

  protected rejectAll(): void {
    const analysis = this.selectedAnalysis();
    if (!analysis) return;
    for (const field of analysis.fields) field.decision = 'REJECTED';
  }

  protected chooseDecision(field: PhotoAnalysisField, decision: PhotoAnalysisFieldDecision): void {
    field.decision = decision;
    if (decision !== 'MODIFIED') field.editedValue = null;
    if (decision === 'MODIFIED' && !field.editedValue) {
      field.editedValue = field.proposedValue ?? field.currentValue ?? null;
    }
  }

  protected fieldsFor(section: PhotoAnalysisField['section']): PhotoAnalysisField[] {
    return this.selectedAnalysis()?.fields.filter((field) => field.section === section) ?? [];
  }

  protected providerAvailable(provider: PhotoAnalysisProviderType): boolean {
    return this.providers().some((item) => item.provider === provider && item.available);
  }

  protected providerLabel(provider: PhotoAnalysisProviderType): string {
    return {
      MOCK: 'MOCK — collaudo gratuito',
      OLLAMA_VISION: 'Ollama Vision — locale gratuito',
      OPENAI_VISION: 'OpenAI Vision — opzionale a consumo',
    }[provider];
  }

  protected typeLabel(type: PhotoAnalysisType): string {
    return {
      COMPLETE: 'Analisi completa',
      HAIR_PROFILE: 'Solo profilo capelli',
      FACE_PROFILE: 'Solo profilo viso',
      COLOR_ANALYSIS: 'Solo armocromia',
    }[type];
  }

  protected sectionLabel(section: PhotoAnalysisField['section']): string {
    return {
      HAIR_PROFILE: 'Profilo capelli',
      FACE_PROFILE: 'Profilo viso',
      COLOR_ANALYSIS: 'Armocromia',
    }[section];
  }

  protected valueLabel(value?: string | null): string {
    if (!value) return 'Non disponibile';
    return value
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
  }

  protected statusLabel(status: CustomerPhotoAnalysis['status']): string {
    return {
      DRAFT: 'Bozza da revisionare',
      UNDER_REVIEW: 'Revisione in corso',
      PARTIALLY_ACCEPTED: 'Parzialmente accettata',
      ACCEPTED: 'Applicata ai profili',
      REJECTED: 'Rifiutata',
      FAILED: 'Analisi fallita',
    }[status];
  }

  protected imageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/assets/')) {
      return value;
    }
    return value.startsWith('/hairlab/') ? `${HAIRLAB_SERVER_BASE_URL}${value}` : value;
  }
}
