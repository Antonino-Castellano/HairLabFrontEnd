import {
  DatePipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  ColorFormulaEvolution,
  ColorFormulaEvolutionStep
} from '../../../models/color-formula-evolution';

import {
  ColorFormulaHistoryIngredient,
  ColorFormulaHistoryItem
} from '../../../models/color-formula-history';

import {
  ColorResultAssessment
} from '../../../models/color-formula-result';

import {
  ColorFormulaHistoryService
} from '../../../service/color-formula-history-service';

import {
  COLOR_APPLICATION_LABELS,
  COLOR_FORMULA_ORIGIN_LABELS,
  COLOR_FORMULA_STATUS_LABELS,
  MIXING_RATIO_LABELS,
  OXYGEN_LABELS
} from '../color-formula-display';

import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

interface IngredientDelta {
  hairDyeId: number;
  label: string;
  before: number;
  after: number;
  delta: number;
  kind: 'ADDED' | 'REMOVED' | 'CHANGED';
}

/**
 * Timeline comparativa delle revisioni di una formula.
 *
 * Mostra solo la famiglia parentFormula -> revisioni.
 * Le ricorrenze restano collegate separatamente tramite referenceSourceFormulaId.
 */
@Component({
  selector: 'app-color-formula-evolution',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './color-formula-evolution.html',
  styleUrl: './color-formula-evolution.css'
})
export class ColorFormulaEvolutionComponent
  implements OnInit {

  private readonly historyService =
    inject(ColorFormulaHistoryService);

  private readonly route =
    inject(ActivatedRoute);

  protected readonly evolution =
    signal<ColorFormulaEvolution | null>(null);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly statusLabels =
    COLOR_FORMULA_STATUS_LABELS;

  protected readonly originLabels =
    COLOR_FORMULA_ORIGIN_LABELS;

  protected readonly toneLabels =
    TONE_LEVEL_LABELS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  protected readonly applicationLabels =
    COLOR_APPLICATION_LABELS;

  protected readonly oxygenLabels =
    OXYGEN_LABELS;

  protected readonly ratioLabels =
    MIXING_RATIO_LABELS;

  protected readonly resultAssessmentLabels:
    Record<ColorResultAssessment, string> = {

      EXCELLENT: 'Eccellente',
      GOOD: 'Buono',
      PARTIAL: 'Parziale',
      CORRECTION_REQUIRED: 'Da correggere'
    };

  protected readonly latestStep =
    computed(
      () => {

        const steps =
          this.evolution()?.steps ?? [];

        return steps.length > 0
          ? steps[steps.length - 1]
          : null;
      }
    );

  ngOnInit(): void {

    const formulaId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (
      Number.isNaN(formulaId)
      ||
      formulaId <= 0
    ) {

      this.errorMessage.set(
        'ID formula non valido.'
      );

      return;
    }

    this.load(formulaId);
  }

  private load(
    formulaId: number
  ): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.historyService
      .getEvolution(formulaId)
      .subscribe({

        next: evolution => {

          this.evolution.set(evolution);
          this.loading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.loading.set(false);
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare la timeline evolutiva.'
            )
          );
        }
      });
  }

  protected previousStep(
    index: number
  ): ColorFormulaEvolutionStep | null {

    const steps =
      this.evolution()?.steps ?? [];

    return index > 0
      ? steps[index - 1]
      : null;
  }

  protected formulaChanges(
    previous: ColorFormulaHistoryItem,
    current: ColorFormulaHistoryItem
  ): string[] {

    const before = previous.formula;
    const after = current.formula;
    const changes: string[] = [];

    if (
      before.targetToneLevel !== after.targetToneLevel
    ) {
      changes.push(
        `Tono target: ${before.targetToneLevel ? this.toneLabels[before.targetToneLevel] : '—'} → ${after.targetToneLevel ? this.toneLabels[after.targetToneLevel] : '—'}`
      );
    }

    if (
      before.targetPrimaryReflection !== after.targetPrimaryReflection
    ) {
      changes.push(
        `Riflesso: ${before.targetPrimaryReflection ? this.reflectionLabels[before.targetPrimaryReflection] : '—'} → ${after.targetPrimaryReflection ? this.reflectionLabels[after.targetPrimaryReflection] : '—'}`
      );
    }

    if (
      before.targetSecondaryReflection !== after.targetSecondaryReflection
    ) {
      changes.push(
        `Secondo riflesso: ${before.targetSecondaryReflection ? this.reflectionLabels[before.targetSecondaryReflection] : '—'} → ${after.targetSecondaryReflection ? this.reflectionLabels[after.targetSecondaryReflection] : '—'}`
      );
    }

    if (
      before.volumeDeveloper !== after.volumeDeveloper
    ) {
      changes.push(
        `Developer: ${this.oxygenLabels[before.volumeDeveloper]} → ${this.oxygenLabels[after.volumeDeveloper]}`
      );
    }

    if (
      before.mixingRatio !== after.mixingRatio
      ||
      before.customDeveloperRatio !== after.customDeveloperRatio
    ) {
      changes.push(
        `Rapporto: ${this.getRatioLabel(before)} → ${this.getRatioLabel(after)}`
      );
    }

    if (
      before.applicationType !== after.applicationType
    ) {
      changes.push(
        `Applicazione: ${before.applicationType ? this.applicationLabels[before.applicationType] : '—'} → ${after.applicationType ? this.applicationLabels[after.applicationType] : '—'}`
      );
    }

    const beforeLine =
      [
        before.technicalLineBrand,
        before.technicalLineName
      ]
        .filter(Boolean)
        .join(' · ')
        || 'Nessuna linea';

    const afterLine =
      [
        after.technicalLineBrand,
        after.technicalLineName
      ]
        .filter(Boolean)
        .join(' · ')
        || 'Nessuna linea';

    if (
      beforeLine !== afterLine
    ) {
      changes.push(
        `Linea tecnica: ${beforeLine} → ${afterLine}`
      );
    }

    if (
      before.targetResult !== after.targetResult
    ) {
      changes.push(
        `Obiettivo: ${before.targetResult} → ${after.targetResult}`
      );
    }

    return changes;
  }

  protected ingredientDeltas(
    previous: ColorFormulaHistoryItem,
    current: ColorFormulaHistoryItem
  ): IngredientDelta[] {

    const before =
      new Map<number, ColorFormulaHistoryIngredient>(
        previous.ingredients.map(
          item => [item.hairDyeId, item]
        )
      );

    const after =
      new Map<number, ColorFormulaHistoryIngredient>(
        current.ingredients.map(
          item => [item.hairDyeId, item]
        )
      );

    const ids =
      new Set<number>([
        ...before.keys(),
        ...after.keys()
      ]);

    const deltas: IngredientDelta[] = [];

    for (
      const id of ids
    ) {

      const oldItem = before.get(id);
      const newItem = after.get(id);
      const beforeQuantity = oldItem?.quantity ?? 0;
      const afterQuantity = newItem?.quantity ?? 0;

      if (
        beforeQuantity === afterQuantity
      ) {
        continue;
      }

      const product =
        newItem ?? oldItem!;

      deltas.push({
        hairDyeId: id,
        label: `${product.brand} · ${product.code} · ${product.name}`,
        before: beforeQuantity,
        after: afterQuantity,
        delta: Number(
          (afterQuantity - beforeQuantity).toFixed(2)
        ),
        kind:
          !oldItem
            ? 'ADDED'
            : !newItem
              ? 'REMOVED'
              : 'CHANGED'
      });
    }

    return deltas;
  }

  protected hasChanges(
    previous: ColorFormulaHistoryItem,
    current: ColorFormulaHistoryItem
  ): boolean {

    return (
      this.formulaChanges(previous, current).length > 0
      ||
      this.ingredientDeltas(previous, current).length > 0
    );
  }

  protected getRatioLabel(
    formula: ColorFormulaHistoryItem['formula']
  ): string {

    if (
      formula.mixingRatio === 'CUSTOM'
    ) {

      return `1 : ${formula.customDeveloperRatio ?? '—'}`;
    }

    return this.ratioLabels[
      formula.mixingRatio
    ];
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const message =
      error.error?.message;

    return (
      typeof message === 'string'
      &&
      message.trim()
    )
      ? message
      : fallback;
  }
}
