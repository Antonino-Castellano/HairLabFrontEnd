import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HAIRLAB_SERVER_BASE_URL } from '../../../../core/config/api.config';
import { CustomerAiConsent } from '../../../../models/ai-consent';
import { Consultation } from '../../../../models/consultation';
import { CustomerPhoto } from '../../../../models/customer-photo';
import {
  AiBudgetSummary,
  HairSimulation,
  ProviderPreference,
  SimulationGenerationQuote,
  SimulationProvider,
  SimulationProviderAvailability,
  SimulationType,
} from '../../../../models/hair-simulation';
import { RecommendationComponent } from '../../../../models/recommendation-component';
import { RecommendationItem } from '../../../../models/recommendation-item';
import { HairSimulationAudit } from '../../../../models/simulation-audit';
import { StyleRecommendation } from '../../../../models/style-recommendation';
import { AiConsentService } from '../../../../service/ai-consent-service';
import { ConsultationService } from '../../../../service/consultation-service';
import { CustomerPhotoService } from '../../../../service/customer-photo-service';
import { HairSimulationService } from '../../../../service/hair-simulation-service';
import { SimulationAuditService } from '../../../../service/simulation-audit-service';
import { SimulationSettingsService } from '../../../../service/simulation-settings-service';
import { StyleRecommendationService } from '../../../../service/style-recommendation-service';
import {
  hairLabCatalogName,
  hairLabTechnicalLabel,
  hairLabTechnicalText,
} from '../../../../shared/ui/hairlab-technical-labels';
import { ToastService } from '../../../../shared/ui/toast.service';
import { REFLECTION_COLORS, TONE_LEVEL_COLORS } from '../../../color-lab/color-lab-display';
import { CustomerPhotoGalleryComponent } from '../../customer-photo-gallery/customer-photo-gallery';

type RecommendationTab = 'haircut' | 'fringe' | 'beard' | 'color' | 'total-look';

@Component({
  selector: 'app-style-recommendation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerPhotoGalleryComponent],
  templateUrl: './style-recommendation-detail.html',
  styleUrl: './style-recommendation-detail.css',
})
export class StyleRecommendationDetailComponent implements OnChanges {
  private readonly styleRecommendationService = inject(StyleRecommendationService);
  private readonly consultationService = inject(ConsultationService);
  private readonly photoService = inject(CustomerPhotoService);
  private readonly simulationService = inject(HairSimulationService);
  private readonly consentService = inject(AiConsentService);
  private readonly auditService = inject(SimulationAuditService);
  private readonly settingsService = inject(SimulationSettingsService);
  private readonly toastService = inject(ToastService);

  @Input({ required: true }) customerId!: number;

  protected readonly recommendations = signal<StyleRecommendation | null>(null);
  protected readonly consultations = signal<Consultation[]>([]);
  protected readonly sourcePhoto = signal<CustomerPhoto | null>(null);
  protected readonly simulations = signal<HairSimulation[]>([]);
  protected readonly providers = signal<SimulationProviderAvailability[]>([]);
  protected readonly consent = signal<CustomerAiConsent | null>(null);
  protected readonly audit = signal<HairSimulationAudit[]>([]);
  protected readonly providerPreference = signal<ProviderPreference | null>(null);
  protected readonly budget = signal<AiBudgetSummary | null>(null);
  protected readonly quote = signal<SimulationGenerationQuote | null>(null);
  protected readonly selectedConsultationId = signal<number | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingConsultations = signal(false);
  protected readonly loadingSource = signal(false);
  protected readonly loadingGovernance = signal(false);
  protected readonly loadingQuote = signal(false);
  protected readonly savingRecommendationCode = signal<string | null>(null);
  protected readonly preparingSimulationCode = signal<string | null>(null);
  protected readonly generatingSimulationId = signal<number | null>(null);
  protected readonly deletingSimulationId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly activeTab = signal<RecommendationTab>('haircut');

  protected readonly consentConfirmed = signal(false);
  protected readonly consentNotes = signal('');
  protected readonly revokeDeletePhotos = signal(false);
  protected readonly revokeDeleteSimulations = signal(false);
  protected readonly revokeReason = signal('');
  protected readonly providerDialogOpen = signal(false);
  protected readonly dialogItem = signal<RecommendationItem | null>(null);
  protected readonly dialogSimulation = signal<HairSimulation | null>(null);
  protected readonly selectedProvider = signal<SimulationProvider>('MOCK');
  protected readonly rememberProviderPreference = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId) {
      this.loadAll();
      this.loadConsultations();
    }
  }

  protected loadAll(): void {
    this.loadRecommendations();
    this.loadSourcePhoto();
    this.loadSimulations();
    this.loadGovernance();
  }

  protected loadRecommendations(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.styleRecommendationService.getByCustomerId(this.customerId).subscribe({
      next: (result) => {
        this.recommendations.set(result);
        this.activeTab.set('haircut');
        this.loading.set(false);
      },
      error: (error) => {
        this.recommendations.set(null);
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Impossibile generare i suggerimenti HairLab.',
        );
      },
    });
  }

  protected loadSourcePhoto(): void {
    this.loadingSource.set(true);
    this.photoService.resolveSource(this.customerId).subscribe({
      next: (photo) => {
        this.sourcePhoto.set(photo);
        this.loadingSource.set(false);
      },
      error: () => {
        this.sourcePhoto.set(null);
        this.loadingSource.set(false);
      },
    });
  }

  protected handleSourceChanged(photo: CustomerPhoto | null): void {
    this.sourcePhoto.set(photo);
    this.loadSimulations();
  }

  protected loadSimulations(): void {
    this.simulationService.getByCustomer(this.customerId).subscribe({
      next: (items) => this.simulations.set(items),
      error: () => this.simulations.set([]),
    });
  }

  protected loadGovernance(): void {
    this.loadingGovernance.set(true);
    this.loadProviders();
    this.consentService.current(this.customerId).subscribe({
      next: (value) => {
        this.consent.set(value);
        this.loadingGovernance.set(false);
      },
      error: () => {
        this.consent.set(null);
        this.loadingGovernance.set(false);
      },
    });
    this.auditService.getByCustomer(this.customerId).subscribe({
      next: (items) => this.audit.set(items),
      error: () => this.audit.set([]),
    });
    this.settingsService.getPreference().subscribe({
      next: (value) => this.providerPreference.set(value),
      error: () => this.providerPreference.set(null),
    });
    this.settingsService.getBudget().subscribe({
      next: (value) => this.budget.set(value),
      error: () => this.budget.set(null),
    });
  }

  protected loadProviders(simulationType?: SimulationType): void {
    this.simulationService.getProviders(simulationType).subscribe({
      next: (items) => this.providers.set(items),
      error: () => this.providers.set([]),
    });
  }

  protected loadConsultations(): void {
    this.loadingConsultations.set(true);
    this.consultationService.getByCustomerId(this.customerId).subscribe({
      next: (items) => {
        this.consultations.set(items);
        if (!this.selectedConsultationId() && items.length) {
          this.selectedConsultationId.set(items[0].id ?? null);
        }
        this.loadingConsultations.set(false);
      },
      error: () => {
        this.consultations.set([]);
        this.selectedConsultationId.set(null);
        this.loadingConsultations.set(false);
      },
    });
  }

  protected grantConsent(): void {
    if (!this.consentConfirmed()) {
      this.toastService.warning(
        'Conferma necessaria',
        'Dichiara di aver acquisito il consenso esplicito del cliente.',
      );
      return;
    }
    this.consentService
      .grant(this.customerId, {
        confirmed: true,
        documentVersion: 'HAIRLAB-AI-1.0',
        notes: this.consentNotes().trim() || null,
      })
      .subscribe({
        next: (value) => {
          this.consent.set(value);
          this.consentConfirmed.set(false);
          this.consentNotes.set('');
          this.toastService.success(
            'Consenso registrato',
            'Le generazioni manuali sono ora abilitate per questo cliente.',
          );
          this.refreshAudit();
        },
        error: (error) =>
          this.toastService.error(
            'Consenso non registrato',
            error?.error?.message ?? 'Impossibile salvare il consenso.',
          ),
      });
  }

  protected revokeConsent(): void {
    if (!this.consent()?.valid) return;
    const confirmed = window.confirm(
      'Revocare il consenso IA? Le future generazioni verranno bloccate. Le eliminazioni selezionate sono definitive.',
    );
    if (!confirmed) return;

    this.consentService
      .revoke(this.customerId, {
        reason: this.revokeReason().trim() || null,
        deletePhotos: this.revokeDeletePhotos(),
        deleteSimulations: this.revokeDeleteSimulations(),
      })
      .subscribe({
        next: (value) => {
          this.consent.set(value);
          this.revokeReason.set('');
          this.revokeDeletePhotos.set(false);
          this.revokeDeleteSimulations.set(false);
          this.closeProviderDialog();
          this.loadSourcePhoto();
          this.loadSimulations();
          this.refreshAudit();
          this.toastService.success(
            'Consenso revocato',
            'HairLab ha bloccato ogni nuova elaborazione IA per il cliente.',
          );
        },
        error: (error) =>
          this.toastService.error(
            'Revoca non riuscita',
            error?.error?.message ?? 'Impossibile revocare il consenso.',
          ),
      });
  }

  protected consentNotesChanged(event: Event): void {
    this.consentNotes.set((event.target as HTMLTextAreaElement).value);
  }

  protected revokeReasonChanged(event: Event): void {
    this.revokeReason.set((event.target as HTMLInputElement).value);
  }

  protected consentConfirmedChanged(event: Event): void {
    this.consentConfirmed.set((event.target as HTMLInputElement).checked);
  }

  protected revokeDeletePhotosChanged(event: Event): void {
    this.revokeDeletePhotos.set((event.target as HTMLInputElement).checked);
  }

  protected revokeDeleteSimulationsChanged(event: Event): void {
    this.revokeDeleteSimulations.set((event.target as HTMLInputElement).checked);
  }

  protected updateProviderPreference(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SimulationProvider | '';
    this.settingsService.updatePreference(value || null).subscribe({
      next: (preference) => {
        this.providerPreference.set(preference);
        this.loadProviders();
        this.toastService.success(
          'Preferenza aggiornata',
          value
            ? `Provider preferito: ${this.providerDisplayName(value)}.`
            : 'Uso del provider predefinito.',
        );
      },
      error: (error) =>
        this.toastService.error(
          'Preferenza non aggiornata',
          error?.error?.message ?? 'Impossibile salvare la preferenza provider.',
        ),
    });
  }

  protected openProviderDialog(item: RecommendationItem): void {
    if (!item.code) {
      this.toastService.error(
        'Simulazione non disponibile',
        'Manca il codice tecnico della proposta.',
      );
      return;
    }
    if (!this.sourcePhoto()?.imageUrl) {
      this.toastService.warning(
        'Aggiungi una foto di partenza',
        'Carica una foto recente oppure usa la foto profilo del cliente.',
      );
      return;
    }

    const existing = this.simulationFor(item);
    if (existing) {
      this.configureProviderDialog(item, existing);
      return;
    }

    this.preparingSimulationCode.set(item.code);
    this.simulationService
      .create(this.customerId, {
        sourcePhotoId: this.sourcePhoto()?.id ?? null,
        simulationType: this.simulationType(item),
        recommendationCode: item.code,
        recommendationTitle: item.title,
        technicalSpec: item.futureSimulation ?? null,
      })
      .subscribe({
        next: (simulation) => {
          this.replaceSimulation(simulation);
          this.preparingSimulationCode.set(null);
          this.configureProviderDialog(item, simulation);
        },
        error: (error) => {
          this.preparingSimulationCode.set(null);
          this.toastService.error(
            'Preparazione non riuscita',
            error?.error?.message ?? 'Impossibile creare la simulazione.',
          );
        },
      });
  }

  private configureProviderDialog(item: RecommendationItem, simulation: HairSimulation): void {
    this.dialogItem.set(item);
    this.dialogSimulation.set(simulation);
    this.quote.set(null);
    this.rememberProviderPreference.set(false);
    this.providerDialogOpen.set(true);
    this.simulationService.getProviders(this.simulationType(item)).subscribe({
      next: (items) => {
        this.providers.set(items);
        const preferred =
          items.find((provider) => provider.preferredProvider && provider.available) ??
          items.find((provider) => provider.defaultProvider && provider.available) ??
          items.find((provider) => provider.provider === 'MOCK' && provider.available) ??
          items.find((provider) => provider.available);
        this.selectedProvider.set(preferred?.provider ?? 'MOCK');
        this.requestQuote();
      },
      error: () => {
        this.providers.set([]);
        this.selectedProvider.set('MOCK');
      },
    });
  }

  protected closeProviderDialog(): void {
    if (this.generatingSimulationId()) return;
    this.providerDialogOpen.set(false);
    this.dialogItem.set(null);
    this.dialogSimulation.set(null);
    this.quote.set(null);
  }

  protected selectProvider(provider: SimulationProvider): void {
    this.selectedProvider.set(provider);
    this.quote.set(null);
    this.requestQuote();
  }

  protected rememberProviderChanged(event: Event): void {
    this.rememberProviderPreference.set((event.target as HTMLInputElement).checked);
  }

  protected requestQuote(): void {
    const simulation = this.dialogSimulation();
    if (!simulation || this.selectedProvider() === 'NONE') return;
    this.loadingQuote.set(true);
    this.simulationService
      .quote(simulation.id, {
        provider: this.selectedProvider(),
        force: simulation.status === 'COMPLETED',
        manualConfirmation: false,
      })
      .subscribe({
        next: (value) => {
          this.quote.set(value);
          this.loadingQuote.set(false);
        },
        error: (error) => {
          this.quote.set(null);
          this.loadingQuote.set(false);
          this.toastService.error(
            'Preventivo non disponibile',
            error?.error?.message ?? 'Impossibile verificare il provider selezionato.',
          );
        },
      });
  }

  protected confirmGeneration(): void {
    const simulation = this.dialogSimulation();
    const provider = this.selectedProvider();
    const quote = this.quote();
    if (!simulation || provider === 'NONE' || !quote) return;
    if (!this.consent()?.valid || !quote.consentValid) {
      this.toastService.warning(
        'Consenso IA assente',
        'Registra il consenso esplicito del cliente prima della generazione.',
      );
      return;
    }
    if (!quote.providerAvailable) {
      this.toastService.warning('Provider non disponibile', quote.message);
      return;
    }

    this.generatingSimulationId.set(simulation.id);
    this.simulationService
      .generate(simulation.id, {
        provider,
        force: simulation.status === 'COMPLETED',
        manualConfirmation: true,
        rememberProviderPreference: this.rememberProviderPreference(),
      })
      .subscribe({
        next: (updated) => {
          this.replaceSimulation(updated);
          this.dialogSimulation.set(updated);
          this.generatingSimulationId.set(null);
          this.providerDialogOpen.set(false);
          this.refreshAudit();
          this.refreshBudget();
          this.loadProviders();
          if (updated.status === 'COMPLETED') {
            this.toastService.success(
              updated.cachedFromSimulationId
                ? 'Risultato recuperato dalla cache'
                : 'Simulazione completata',
              updated.cachedFromSimulationId
                ? 'Nessuna nuova elaborazione o spesa è stata necessaria.'
                : `${this.providerDisplayName(updated.provider)} ha salvato il risultato.`,
            );
          } else {
            this.toastService.error(
              'Generazione non riuscita',
              updated.errorMessage ?? 'Il provider ha restituito uno stato di errore.',
            );
          }
        },
        error: (error) => {
          this.generatingSimulationId.set(null);
          this.toastService.error(
            'Generazione non riuscita',
            error?.error?.message ?? 'Impossibile eseguire la simulazione.',
          );
        },
      });
  }

  protected deleteSimulation(item: RecommendationItem): void {
    const simulation = this.simulationFor(item);
    if (!simulation) return;
    if (!window.confirm('Eliminare la simulazione e il relativo risultato dallo storico attivo?')) {
      return;
    }
    this.deletingSimulationId.set(simulation.id);
    this.simulationService.delete(simulation.id).subscribe({
      next: () => {
        this.simulations.update((items) => items.filter((value) => value.id !== simulation.id));
        this.deletingSimulationId.set(null);
        this.refreshAudit();
        this.toastService.success(
          'Simulazione eliminata',
          'Il risultato non è più nello storico attivo.',
        );
      },
      error: (error) => {
        this.deletingSimulationId.set(null);
        this.toastService.error(
          'Eliminazione non riuscita',
          error?.error?.message ?? 'Impossibile eliminare la simulazione.',
        );
      },
    });
  }

  protected providerFor(type: SimulationProvider): SimulationProviderAvailability | null {
    return this.providers().find((value) => value.provider === type) ?? null;
  }

  protected providerDisplayName(provider: SimulationProvider | null | undefined): string {
    return {
      NONE: 'Nessun provider',
      MOCK: 'MOCK',
      OPENAI: 'OpenAI',
      LOCAL_COMFYUI: 'ComfyUI locale',
    }[provider ?? 'NONE'];
  }

  protected providerLabel(simulation: HairSimulation | null): string {
    if (!simulation || simulation.provider === 'NONE') return 'Provider non eseguito';
    if (simulation.provider === 'MOCK') return 'MOCK · collaudo senza IA reale';
    if (simulation.provider === 'LOCAL_COMFYUI') return 'ComfyUI locale · costo API $0';
    return 'OpenAI · generazione a consumo';
  }

  protected providerStatusLabel(provider: SimulationProviderAvailability): string {
    if (provider.available) return 'Disponibile';
    return provider.diagnosticMessage || 'Non disponibile';
  }

  protected providerIcon(provider: SimulationProvider): string {
    return { MOCK: '◇', OPENAI: '✦', LOCAL_COMFYUI: '⬡', NONE: '–' }[provider];
  }

  protected formatUsd(value?: number | null): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  }

  protected canConfirmGeneration(): boolean {
    const value = this.quote();
    return !!(
      value &&
      value.providerAvailable &&
      value.consentValid &&
      this.consent()?.valid &&
      !this.generatingSimulationId()
    );
  }

  protected generationActionLabel(item: RecommendationItem): string {
    const simulation = this.simulationFor(item);
    if (this.preparingSimulationCode() === item.code) return 'Preparazione...';
    if (simulation && this.generatingSimulationId() === simulation.id)
      return 'Generazione in corso...';
    if (simulation?.status === 'COMPLETED') return '↻ Rigenera simulazione';
    if (simulation?.status === 'FAILED') return '↻ Riprova simulazione';
    if (simulation?.status === 'QUEUED' || simulation?.status === 'PROCESSING') {
      return 'Elaborazione in corso...';
    }
    return '✦ Genera simulazione IA';
  }

  protected simulationActionDisabled(item: RecommendationItem): boolean {
    const simulation = this.simulationFor(item);
    if (!this.sourcePhoto() || !item.code) return true;
    if (this.preparingSimulationCode() === item.code) return true;
    return !!(
      simulation &&
      (this.generatingSimulationId() === simulation.id ||
        simulation.status === 'QUEUED' ||
        simulation.status === 'PROCESSING')
    );
  }

  private refreshAudit(): void {
    this.auditService.getByCustomer(this.customerId).subscribe({
      next: (items) => this.audit.set(items),
      error: () => undefined,
    });
  }

  private refreshBudget(): void {
    this.settingsService.getBudget().subscribe({
      next: (value) => this.budget.set(value),
      error: () => undefined,
    });
  }

  private replaceSimulation(updated: HairSimulation): void {
    this.simulations.update((items) => [
      updated,
      ...items.filter((value) => value.id !== updated.id),
    ]);
  }

  protected simulationFor(item: RecommendationItem): HairSimulation | null {
    if (!item.code) return null;
    return (
      this.simulations().find(
        (simulation) =>
          simulation.recommendationCode === item.code &&
          simulation.simulationType === this.simulationType(item) &&
          simulation.status !== 'CANCELLED',
      ) ?? null
    );
  }

  protected simulationStatusLabel(simulation: HairSimulation | null): string {
    if (!simulation) return 'Non ancora generata';
    return {
      DRAFT: 'Manca la foto di partenza',
      READY: 'Pronta per la scelta del provider',
      QUEUED: 'In coda controllata',
      PROCESSING: 'Generazione in corso',
      COMPLETED: simulation.cachedFromSimulationId
        ? 'Risultato recuperato dalla cache'
        : 'Simulazione completata',
      FAILED: 'Generazione non riuscita',
      CANCELLED: 'Simulazione annullata',
    }[simulation.status];
  }

  protected simulationType(item: RecommendationItem): SimulationType {
    switch (item.category) {
      case 'FRINGE':
        return 'FRINGE';
      case 'BEARD':
        return 'BEARD';
      case 'COLOR':
        return 'COLOR';
      case 'TOTAL_LOOK':
        return 'TOTAL_LOOK';
      default:
        return 'HAIRCUT';
    }
  }

  protected sourceImageUrl(): string | null {
    return this.resolveImageUrl(this.sourcePhoto()?.imageUrl);
  }

  protected generatedImageUrl(simulation: HairSimulation | null): string | null {
    return this.resolveImageUrl(simulation?.generatedImageUrl);
  }

  protected selectTab(tab: RecommendationTab): void {
    this.activeTab.set(tab);
  }

  protected selectConsultation(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedConsultationId.set(value ? Number(value) : null);
  }

  protected saveToConsultation(item: RecommendationItem): void {
    const consultationId = this.selectedConsultationId();
    if (!consultationId) {
      this.toastService.warning(
        'Seleziona una consulenza',
        'Crea o scegli una consulenza del cliente.',
      );
      return;
    }
    if (!item.code) {
      this.toastService.error('Suggerimento non salvabile', 'Il codice tecnico non è disponibile.');
      return;
    }

    this.savingRecommendationCode.set(item.code);
    this.consultationService
      .saveRecommendation(consultationId, {
        category: item.category,
        recommendationCode: item.code,
        decisionStatus: 'PROPOSED',
      })
      .subscribe({
        next: (saved) => {
          this.consultations.update((consultations) =>
            consultations.map((consultation) => {
              if (consultation.id !== consultationId) return consultation;
              const current = consultation.recommendations ?? [];
              return {
                ...consultation,
                recommendations: [saved, ...current.filter((value) => value.id !== saved.id)],
              };
            }),
          );
          this.savingRecommendationCode.set(null);
          this.toastService.success(
            'Suggerimento salvato',
            'La proposta è stata aggiunta alla consulenza.',
          );
        },
        error: (error) => {
          this.savingRecommendationCode.set(null);
          this.toastService.error(
            'Salvataggio non riuscito',
            error?.error?.message ?? 'Impossibile collegare il suggerimento alla consulenza.',
          );
        },
      });
  }

  protected isSaved(item: RecommendationItem): boolean {
    const consultationId = this.selectedConsultationId();
    if (!consultationId || !item.code) return false;
    const consultation = this.consultations().find((value) => value.id === consultationId);
    return !!consultation?.recommendations?.some(
      (value) => value.recommendationCode === item.code && value.category === item.category,
    );
  }

  protected isMale(data: StyleRecommendation): boolean {
    return data.gender === 'MALE';
  }

  protected itemsForActiveTab(data: StyleRecommendation): RecommendationItem[] {
    switch (this.activeTab()) {
      case 'fringe':
        return data.fringeRecommendations;
      case 'beard':
        return data.beardRecommendations;
      case 'color':
        return data.colorRecommendations;
      case 'total-look':
        return data.totalLookRecommendations;
      default:
        return data.haircutRecommendations;
    }
  }

  protected scoreWidth(score?: number | null): string {
    return `${Math.max(0, Math.min(100, score ?? 0))}%`;
  }

  protected scoreLabel(score?: number | null): string {
    const value = score ?? 0;
    if (value >= 90) return 'Compatibilità molto alta';
    if (value >= 75) return 'Compatibilità alta';
    if (value >= 60) return 'Compatibilità buona';
    if (value >= 40) return 'Compatibilità moderata';
    return 'Da valutare';
  }

  protected adjustmentLabel(value?: number | null): string {
    const adjustment = value ?? 0;
    return `${adjustment >= 0 ? '+' : ''}${adjustment}`;
  }

  protected isTopRecommendation(item: RecommendationItem, items: RecommendationItem[]): boolean {
    return (
      items.length > 0 &&
      item.compatibilityScore === Math.max(...items.map((value) => value.compatibilityScore))
    );
  }

  protected details(item: RecommendationItem): [string, string][] {
    return Object.entries(item.technicalDetails ?? {}).map(([key, value]) => [
      hairLabTechnicalText(key),
      hairLabTechnicalText(value),
    ]);
  }

  protected primaryMetrics(item: RecommendationItem): [string, string][] {
    return this.details(item).slice(0, 3);
  }

  protected categoryLabel(value: string | null | undefined): string {
    return hairLabTechnicalLabel(value);
  }

  protected displayTitle(value: string | null | undefined): string {
    return hairLabCatalogName(value);
  }

  protected displayText(value: string | null | undefined): string {
    return hairLabTechnicalText(value);
  }

  protected technicalReferenceUrl(value?: string | null): string | null {
    return this.resolveImageUrl(value);
  }

  protected componentReferenceUrl(component: RecommendationComponent): string | null {
    return this.resolveImageUrl(component.referenceImageUrl);
  }

  protected colorPreviewBackground(item: RecommendationItem): string {
    const target = item.technicalColorTarget;
    const tone = target?.targetToneLevel;
    const primary = target?.targetPrimaryReflection;
    const secondary = target?.targetSecondaryReflection ?? primary;
    const toneColor = tone ? TONE_LEVEL_COLORS[tone] : '#8b6f5b';
    const primaryColor = primary ? REFLECTION_COLORS[primary] : '#a18067';
    const secondaryColor = secondary ? REFLECTION_COLORS[secondary] : primaryColor;
    return `linear-gradient(135deg, ${toneColor} 0%, ${primaryColor} 58%, ${secondaryColor} 100%)`;
  }

  protected hasColorAction(item: RecommendationItem): boolean {
    return (
      !!item.technicalColorTarget ||
      (item.category === 'TOTAL_LOOK' && !!item.futureSimulation?.hairColorCode)
    );
  }

  protected smartFormulaQueryParams(
    item: RecommendationItem,
  ): Record<string, string | number | null> {
    const target = item.technicalColorTarget;
    return {
      customerId: this.customerId,
      sourceRecommendationCode: item.code ?? target?.code ?? null,
      sourceRecommendationTitle: item.title,
      sourceRecommendationCompatibilityScore: item.compatibilityScore,
      targetToneLevel: target?.targetToneLevel ?? null,
      targetPrimaryReflection: target?.targetPrimaryReflection ?? null,
      targetSecondaryReflection: target?.targetSecondaryReflection ?? null,
      applicationType: target?.suggestedApplicationType ?? null,
      targetResult: target?.targetResult ?? item.title,
    };
  }

  private resolveImageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/assets/')) {
      return value;
    }
    return value.startsWith('/hairlab/') ? `${HAIRLAB_SERVER_BASE_URL}${value}` : value;
  }
}
