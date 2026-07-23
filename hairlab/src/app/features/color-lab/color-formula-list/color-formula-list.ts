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
  DatePipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  ColorFormula
} from '../../../models/color-formula';

import {
  Customer
} from '../../../models/customer';

import {
  ColorFormulaStatus
} from '../../../models/enums/color-formula-status';

import {
  ColorFormulaService
} from '../../../service/color-formula-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  COLOR_FORMULA_STATUS_LABELS
} from '../color-formula-display';

/**
 * Elenco delle formule salvate.
 */
@Component({
  selector:
    'app-color-formula-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl:
    './color-formula-list.html',
  styleUrl:
    './color-formula-list.css'
})
export class ColorFormulaListComponent
  implements OnInit {

  private readonly formulaService =
    inject(
      ColorFormulaService
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  protected readonly formulas =
    signal<ColorFormula[]>([]);

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly searchTerm =
    signal('');

  protected readonly customerFilter =
    signal<
      number |
      'ALL'
    >(
      'ALL'
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

  protected readonly filteredFormulas =
    computed(
      () => {

        const search =
          this.searchTerm()
            .trim()
            .toLocaleLowerCase(
              'it'
            );

        return this.formulas()
          .filter(
            formula => {

              if (
                this.customerFilter() !==
                  'ALL'
                &&
                formula.customerId !==
                  this.customerFilter()
              ) {

                return false;
              }

              if (
                this.statusFilter() !==
                  'ALL'
                &&
                formula.status !==
                  this.statusFilter()
              ) {

                return false;
              }

              if (
                search
              ) {

                const customer =
                  this.getCustomerName(
                    formula.customerId
                  );

                const haystack =
                  [
                    formula.name,
                    formula.targetResult,
                    customer
                  ]
                    .join(
                      ' '
                    )
                    .toLocaleLowerCase(
                      'it'
                    );

                if (
                  !haystack.includes(
                    search
                  )
                ) {

                  return false;
                }
              }

              return true;
            }
          )
          .sort(
            (
              first,
              second
            ) =>
              (
                second.createdAt ??
                ''
              )
                .localeCompare(
                  first.createdAt ??
                  ''
                )
          );
      }
    );

  ngOnInit(): void {

    this.loadData();
  }

  private loadData():
    void {

    this.loading.set(
      true
    );

    forkJoin({

      formulas:
        this.formulaService
          .getAll(),

      customers:
        this.customerService
          .getAll()

    }).subscribe({

      next: result => {

        this.formulas.set(
          result.formulas ??
          []
        );

        this.customers.set(
          result.customers ??
          []
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
          error.error?.message ??
          'Impossibile caricare le formule.'
        );
      }
    });
  }

  protected onSearchChange(
    event:
      Event
  ): void {

    this.searchTerm.set(
      (
        event.target as
          HTMLInputElement
      ).value
    );
  }

  protected onCustomerFilterChange(
    event:
      Event
  ): void {

    const value =
      (
        event.target as
          HTMLSelectElement
      ).value;

    this.customerFilter.set(
      value ===
        'ALL'
        ? 'ALL'
        : Number(
            value
          )
    );
  }

  protected onStatusFilterChange(
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

  protected getCustomerName(
    customerId:
      number |
      undefined
  ): string {

    if (
      !customerId
    ) {

      return 'Cliente non collegato';
    }

    const customer =
      this.customers()
        .find(
          item =>
            item.id ===
            customerId
        );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : `Cliente #${customerId}`;
  }
}
