import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HAIRLAB_SERVER_BASE_URL } from '../../../../core/config/api.config';
import { Consultation } from '../../../../models/consultation';
import { RecommendationComponent } from '../../../../models/recommendation-component';
import { RecommendationItem } from '../../../../models/recommendation-item';
import { StyleRecommendation } from '../../../../models/style-recommendation';
import { ConsultationService } from '../../../../service/consultation-service';
import { StyleRecommendationService } from '../../../../service/style-recommendation-service';
import { REFLECTION_COLORS, TONE_LEVEL_COLORS } from '../../../color-lab/color-lab-display';
import {
  hairLabCatalogName,
  hairLabTechnicalLabel,
  hairLabTechnicalText,
} from '../../../../shared/ui/hairlab-technical-labels';
import { ToastService } from '../../../../shared/ui/toast.service';

type RecommendationTab = 'haircut' | 'fringe' | 'beard' | 'color' | 'total-look';

@Component({
  selector: 'app-style-recommendation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './style-recommendation-detail.html',
  styleUrl: './style-recommendation-detail.css',
})
export class StyleRecommendationDetailComponent implements OnChanges {
  private readonly styleRecommendationService = inject(StyleRecommendationService);
  private readonly consultationService = inject(ConsultationService);
  private readonly toastService = inject(ToastService);

  @Input({ required: true }) customerId!: number;

  protected readonly recommendations = signal<StyleRecommendation | null>(null);
  protected readonly consultations = signal<Consultation[]>([]);
  protected readonly selectedConsultationId = signal<number | null>(null);
  protected readonly loading = signal(false);
  protected readonly loadingConsultations = signal(false);
  protected readonly savingRecommendationCode = signal<string | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly activeTab = signal<RecommendationTab>('haircut');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId) {
      this.loadRecommendations();
      this.loadConsultations();
    }
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
              const next = [saved, ...current.filter((value) => value.id !== saved.id)];
              return { ...consultation, recommendations: next };
            }),
          );
          this.savingRecommendationCode.set(null);
          this.toastService.success(
            'Suggerimento salvato nella consulenza',
            'La proposta è stata rigenerata e storicizzata dal backend.',
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

  protected referenceImageUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/assets/')) {
      return value;
    }
    if (value.startsWith('/hairlab/')) return `${HAIRLAB_SERVER_BASE_URL}${value}`;
    return value;
  }

  protected itemImage(item: RecommendationItem): string | null {
    return this.referenceImageUrl(item.referenceImageUrl);
  }

  protected componentImage(component: RecommendationComponent): string | null {
    return this.referenceImageUrl(component.referenceImageUrl);
  }

  protected visualSymbol(item: RecommendationItem): string {
    switch (item.category) {
      case 'HAIRCUT':
        return '✂';
      case 'FRINGE':
        return '⌁';
      case 'BEARD':
        return '♢';
      case 'COLOR':
        return '◐';
      default:
        return '✦';
    }
  }

  protected componentSymbol(component: RecommendationComponent): string {
    switch (component.category) {
      case 'HAIRCUT':
        return '✂';
      case 'FRINGE':
        return '⌁';
      case 'BEARD':
        return '♢';
      case 'COLOR':
        return '◐';
      default:
        return '✦';
    }
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
}
