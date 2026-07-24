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
  Input,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  ColorFormulaCustomerHistory,
  ColorFormulaHistoryItem
} from '../../../models/color-formula-history';

import {
  ColorFormulaStatus
} from '../../../models/enums/color-formula-status';

import {
  ColorFormulaOrigin
} from '../../../models/enums/color-formula-origin';

import {
  ColorResultAssessment
} from '../../../models/color-formula-result';

import {
  ColorFormulaHistoryService
} from '../../../service/color-formula-history-service';

import {
  COLOR_FORMULA_ORIGIN_LABELS,
  COLOR_FORMULA_STATUS_LABELS
} from '../../color-lab/color-formula-display';

import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../../color-lab/color-lab-display';

/**
 * Storico Color Lab integrato
 * direttamente nella scheda cliente.
 */
@Component({
  selector:
    'app-customer-color-formula-history',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl:
    './customer-color-formula-history.html',
  styleUrl:
    './customer-color-formula-history.css'
})
export class CustomerColorFormulaHistoryComponent
  implements OnChanges {

  @Input({
    required: true
  })
  customerId!: number;

  private readonly historyService =
    inject(
      ColorFormulaHistoryService
    );

  private readonly router =
    inject(
      Router
    );

  protected readonly history =
    signal<ColorFormulaCustomerHistory | null>(
      null
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly duplicatingFormulaId =
    signal<number | null>(
      null
    );

  protected readonly referenceActionFormulaId =
    signal<number | null>(null);

  protected readonly repeatingReference =
    signal(false);

  protected readonly successMessage =
    signal('');

  protected readonly statusFilter =
    signal<
      ColorFormulaStatus |
      'ALL'
    >(
      'ALL'
    );

  protected readonly statuses =
    Object.values(
      ColorFormulaStatus
    );

  protected readonly statusLabels =
    COLOR_FORMULA_STATUS_LABELS;

  protected readonly originLabels =
    COLOR_FORMULA_ORIGIN_LABELS;

  protected readonly toneLabels =
    TONE_LEVEL_LABELS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  protected readonly resultAssessmentLabels:
    Record<ColorResultAssessment, string> = {

      EXCELLENT:
        'Eccellente',

      GOOD:
        'Buono',

      PARTIAL:
        'Parziale',

      CORRECTION_REQUIRED:
        'Da correggere'
    };

  protected readonly filteredItems =
    computed(
      () => {

        const current =
          this.history();

        if (
          !current
        ) {

          return [];
        }

        const filter =
          this.statusFilter();

        if (
          filter ===
          'ALL'
        ) {

          return current.items;
        }

        return current.items
          .filter(
            item =>
              item.formula.status ===
              filter
          );
      }
    );

  ngOnChanges(
    changes:
      SimpleChanges
  ): void {

    if (
      changes['customerId']
      &&
      this.customerId >
      0
    ) {

      this.loadHistory();
    }
  }

  protected loadHistory():
    void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.historyService
      .getByCustomerId(
        this.customerId
      )
      .subscribe({

        next: history => {

          this.history.set(
            history
          );

          this.loading.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loading.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare lo storico formule.'
            )
          );
        }
      });
  }

  protected onStatusChange(
    event:
      Event
  ): void {

    this.statusFilter.set(
      (
        event.target as
          HTMLSelectElement
      ).value as
        ColorFormulaStatus |
        'ALL'
    );
  }

  protected isLatestUsed(
    item:
      ColorFormulaHistoryItem
  ): boolean {

    const latestId =
      this.history()
        ?.latestUsedFormulaId;

    return (
      latestId != null
      &&
      item.formula.id ===
      latestId
    );
  }

  protected duplicateAsDraft(
    item:
      ColorFormulaHistoryItem
  ): void {

    const formulaId =
      item.formula.id;

    if (
      !formulaId
      ||
      this.duplicatingFormulaId() !=
        null
    ) {

      return;
    }

    this.errorMessage.set(
      ''
    );

    this.duplicatingFormulaId.set(
      formulaId
    );

    this.historyService
      .duplicateAsDraft(
        formulaId
      )
      .subscribe({

        next: detail => {

          this.duplicatingFormulaId.set(
            null
          );

          const newId =
            detail.formula.id;

          if (
            newId
          ) {

            this.router.navigate(
              [
                '/color-lab/formulas',
                newId,
                'edit'
              ]
            );
          }
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.duplicatingFormulaId.set(
            null
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile duplicare la formula.'
            )
          );
        }
      });
  }

  protected isReference(
    item: ColorFormulaHistoryItem
  ): boolean {
    return item.formula.referenceFormula === true;
  }

  protected canSetReference(
    item: ColorFormulaHistoryItem
  ): boolean {
    return !item.formula.referenceFormula
      && (
        item.formula.status === ColorFormulaStatus.USED
        || item.formula.status === ColorFormulaStatus.ARCHIVED
      );
  }

  protected setReference(item: ColorFormulaHistoryItem): void {
    const formulaId = item.formula.id;
    if (!formulaId || this.referenceActionFormulaId() != null) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.referenceActionFormulaId.set(formulaId);

    this.historyService.setReferenceFormula(formulaId).subscribe({
      next: () => {
        this.referenceActionFormulaId.set(null);
        this.successMessage.set('Formula impostata come riferimento corrente.');
        this.loadHistory();
      },
      error: (error: HttpErrorResponse) => {
        this.referenceActionFormulaId.set(null);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile impostare la formula come riferimento.')
        );
      }
    });
  }

  protected clearReference(item: ColorFormulaHistoryItem): void {
    const formulaId = item.formula.id;
    if (!formulaId || this.referenceActionFormulaId() != null) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.referenceActionFormulaId.set(formulaId);

    this.historyService.clearReferenceFormula(formulaId).subscribe({
      next: () => {
        this.referenceActionFormulaId.set(null);
        this.successMessage.set('Formula di riferimento rimossa.');
        this.loadHistory();
      },
      error: (error: HttpErrorResponse) => {
        this.referenceActionFormulaId.set(null);
        this.errorMessage.set(
          this.getErrorMessage(error, 'Impossibile rimuovere la formula di riferimento.')
        );
      }
    });
  }

  protected repeatReferenceFormula(): void {
    if (!this.history()?.referenceFormulaId || this.repeatingReference()) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.repeatingReference.set(true);

    this.historyService.repeatReferenceAsDraft(this.customerId).subscribe({
      next: detail => {
        this.repeatingReference.set(false);
        if (detail.formula.id) {
          this.router.navigate(['/color-lab/formulas', detail.formula.id, 'edit']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.repeatingReference.set(false);
        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile creare il nuovo servizio dalla formula di riferimento.'
          )
        );
      }
    });
  }

  protected canEdit(
    item:
      ColorFormulaHistoryItem
  ): boolean {

    return (
      item.formula.status ===
        ColorFormulaStatus.DRAFT
      ||
      item.formula.status ===
        ColorFormulaStatus.PROPOSED
    );
  }

  protected getOriginLabel(
    origin:
      ColorFormulaOrigin |
      null |
      undefined
  ): string {

    return origin
      ? this.originLabels[origin]
      : 'Manuale';
  }

  private getErrorMessage(
    error:
      HttpErrorResponse,
    fallback:
      string
  ): string {

    const backendMessage =
      error.error?.message;

    return (
      typeof backendMessage ===
        'string'
      &&
      backendMessage.trim()
    )
      ? backendMessage
      : fallback;
  }
}
