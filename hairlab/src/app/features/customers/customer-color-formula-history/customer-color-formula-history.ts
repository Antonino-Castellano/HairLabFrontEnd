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
  ColorFormulaHistoryService
} from '../../../service/color-formula-history-service';

import {
  COLOR_FORMULA_STATUS_LABELS
} from '../../color-lab/color-formula-display';

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
