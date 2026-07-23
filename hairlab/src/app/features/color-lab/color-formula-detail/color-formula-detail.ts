import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  ColorFormulaDetail
} from '../../../models/color-formula-management';

import {
  Customer
} from '../../../models/customer';

import {
  HairDye
} from '../../../models/hair-dye';

import {
  ColorFormulaManagementService
} from '../../../service/color-formula-management-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  HairDyeService
} from '../../../service/hair-dye-service';

import {
  COLOR_APPLICATION_LABELS,
  COLOR_FORMULA_STATUS_LABELS,
  MIXING_RATIO_LABELS,
  OXYGEN_LABELS
} from '../color-formula-display';

import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

/**
 * Dettaglio leggibile della formula.
 */
@Component({
  selector:
    'app-color-formula-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl:
    './color-formula-detail.html',
  styleUrl:
    './color-formula-detail.css'
})
export class ColorFormulaDetailComponent
  implements OnInit {

  private readonly managementService =
    inject(
      ColorFormulaManagementService
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  private readonly hairDyeService =
    inject(
      HairDyeService
    );

  private readonly activatedRoute =
    inject(
      ActivatedRoute
    );

  protected readonly detail =
    signal<ColorFormulaDetail | null>(
      null
    );

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly products =
    signal<HairDye[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly statusLabels =
    COLOR_FORMULA_STATUS_LABELS;

  protected readonly applicationLabels =
    COLOR_APPLICATION_LABELS;

  protected readonly oxygenLabels =
    OXYGEN_LABELS;

  protected readonly ratioLabels =
    MIXING_RATIO_LABELS;

  protected readonly toneLabels =
    TONE_LEVEL_LABELS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  ngOnInit(): void {

    const id =
      Number(
        this.activatedRoute
          .snapshot
          .paramMap
          .get(
            'id'
          )
      );

    if (
      Number.isNaN(
        id
      )
      ||
      id <=
      0
    ) {

      this.errorMessage.set(
        'ID formula non valido.'
      );

      return;
    }

    this.load(
      id
    );
  }

  private load(
    id:
      number
  ): void {

    this.loading.set(
      true
    );

    forkJoin({

      detail:
        this.managementService
          .getById(
            id
          ),

      customers:
        this.customerService
          .getAll(),

      products:
        this.hairDyeService
          .getAll()

    }).subscribe({

      next: result => {

        this.detail.set(
          result.detail
        );

        this.customers.set(
          result.customers ??
          []
        );

        this.products.set(
          result.products ??
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
          'Impossibile caricare la formula.'
        );
      }
    });
  }

  protected getCustomerName(
    customerId:
      number |
      undefined
  ): string {

    const customer =
      this.customers()
        .find(
          item =>
            item.id ===
            customerId
        );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Cliente non disponibile';
  }

  protected getProductName(
    hairDyeId:
      number
  ): string {

    const product =
      this.products()
        .find(
          item =>
            item.id ===
            hairDyeId
        );

    return product
      ? `${product.brand} · ${product.code} · ${product.name}`
      : `Prodotto #${hairDyeId}`;
  }

  protected getRatioLabel():
    string {

    const current =
      this.detail();

    if (
      !current
    ) {

      return '—';
    }

    if (
      current.formula.mixingRatio ===
        'CUSTOM'
    ) {

      return (
        `1 : ${current.formula.customDeveloperRatio ?? '—'}`
      );
    }

    return this.ratioLabels[
      current.formula.mixingRatio
    ];
  }
}
