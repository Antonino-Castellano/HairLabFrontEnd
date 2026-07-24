import {
  DatePipe
} from '@angular/common';

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
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { HairDye } from '../../../models/hair-dye';
import { ColorSupplier } from '../../../models/color-supplier';

import {
  HairDyeInventory
} from '../../../models/hair-dye-inventory';

import {
  HairDyeInventoryMovement,
  HairDyeInventoryMovementRequest,
  HairDyeInventoryMovementType
} from '../../../models/hair-dye-inventory-movement';

import {
  InventoryUnit
} from '../../../models/enums/inventory-unit';

import {
  ProductType
} from '../../../models/enums/product-type';

import { HairDyeInventoryMovementService } from '../../../service/hair-dye-inventory-movement-service';
import { ColorSupplierService } from '../../../service/color-supplier-service';

import {
  HairDyeInventoryService
} from '../../../service/hair-dye-inventory-service';

import {
  HairDyeService
} from '../../../service/hair-dye-service';

import {
  INVENTORY_UNIT_LABELS,
  PRODUCT_TYPE_LABELS
} from '../color-lab-display';

/**
 * Scheda completa di una posizione di magazzino.
 *
 * BLOCCO 14:
 * - configurazione iniziale;
 * - soglia scorta;
 * - carichi/scarichi auditabili;
 * - inventario fisico;
 * - storico movimenti.
 */
@Component({
  selector:
    'app-hair-dye-inventory-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe
  ],
  templateUrl:
    './hair-dye-inventory-form.html',
  styleUrl:
    './hair-dye-inventory-form.css'
})
export class HairDyeInventoryFormComponent
  implements OnInit {

  private readonly formBuilder =
    inject(
      FormBuilder
    );

  private readonly hairDyeService =
    inject(
      HairDyeService
    );

  private readonly inventoryService =
    inject(
      HairDyeInventoryService
    );

  private readonly movementService = inject(HairDyeInventoryMovementService);
  private readonly supplierService = inject(ColorSupplierService);

  private readonly activatedRoute =
    inject(
      ActivatedRoute
    );

  private readonly router =
    inject(
      Router
    );

  protected readonly product =
    signal<HairDye | null>(
      null
    );

  protected readonly inventory =
    signal<HairDyeInventory | null>(
      null
    );

  protected readonly movements = signal<HairDyeInventoryMovement[]>([]);
  protected readonly suppliers = signal<ColorSupplier[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly savingMovement =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly successMessage =
    signal('');

  protected hairDyeId =
    0;

  protected readonly units =
    Object.values(
      InventoryUnit
    );

  protected readonly unitLabels =
    INVENTORY_UNIT_LABELS;

  protected readonly productTypeLabels =
    PRODUCT_TYPE_LABELS;

  protected readonly manualMovementTypes:
    HairDyeInventoryMovementType[] = [
      'STOCK_IN',
      'STOCK_OUT',
      'RETURN_IN',
      'ADJUSTMENT_IN',
      'ADJUSTMENT_OUT',
      'INVENTORY_COUNT'
    ];

  protected readonly movementTypeLabels:
    Record<HairDyeInventoryMovementType, string> = {

      INITIAL_STOCK:
        'Apertura iniziale',

      STOCK_IN:
        'Carico merce',

      STOCK_OUT:
        'Scarico manuale',

      FORMULA_USAGE:
        'Utilizzo formula',

      RETURN_IN:
        'Reso / reintegro',

      ADJUSTMENT_IN:
        'Rettifica positiva',

      ADJUSTMENT_OUT:
        'Rettifica negativa',

      INVENTORY_COUNT:
        'Inventario fisico',

      ADJUSTMENT:
        'Rettifica legacy'
    };

  /** Usato soltanto quando la posizione non esiste. */
  protected readonly initialForm =
    this.formBuilder.nonNullable.group({

      quantityAvailable: [
        0,
        [
          Validators.required,
          Validators.min(
            0
          )
        ]
      ],

      unit: [
        InventoryUnit.GRAM,
        Validators.required
      ],

      lowStockThreshold: [20,[Validators.required,Validators.min(0)]],
      reorderTargetQuantity: [100,[Validators.required,Validators.min(0)]],
      preferredSupplierId: [0]
    });

  /** Impostazioni che non modificano silenziosamente lo stock. */
  protected readonly settingsForm =
    this.formBuilder.nonNullable.group({

      unit: [
        InventoryUnit.GRAM,
        Validators.required
      ],

      lowStockThreshold: [20,[Validators.required,Validators.min(0)]],
      reorderTargetQuantity: [100,[Validators.required,Validators.min(0)]],
      preferredSupplierId: [0]
    });

  protected readonly movementForm =
    this.formBuilder.nonNullable.group({

      movementType: [
        'STOCK_IN' as
          HairDyeInventoryMovementType,
        Validators.required
      ],

      quantity: [
        0,
        [
          Validators.required,
          Validators.min(
            0
          )
        ]
      ],

      referenceCode: [
        ''
      ],

      reason: [
        '',
        Validators.required
      ]
    });

  ngOnInit(): void {

    this.supplierService.getActive().subscribe({next:x=>this.suppliers.set(x??[]),error:()=>this.suppliers.set([])});

    const idParam =
      this.activatedRoute.snapshot
        .paramMap
        .get(
          'hairDyeId'
        );

    const id =
      Number(
        idParam
      );

    if (
      !idParam
      ||
      Number.isNaN(
        id
      )
      ||
      id <= 0
    ) {

      this.errorMessage.set(
        'ID prodotto non valido.'
      );

      return;
    }

    this.hairDyeId =
      id;

    this.loadProduct();
  }

  private loadProduct(): void {

    this.loading.set(
      true
    );

    this.hairDyeService
      .getById(
        this.hairDyeId
      )
      .subscribe({

        next: product => {

          this.product.set(
            product
          );

          const defaultUnit =
            product.productType ===
              ProductType.DEVELOPER

              ? InventoryUnit.MILLILITER
              : InventoryUnit.GRAM;

          this.initialForm.patchValue({
            unit:
              defaultUnit
          });

          this.settingsForm.patchValue({
            unit:
              defaultUnit
          });

          this.loadInventory();
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
              'Impossibile caricare il prodotto.'
            )
          );
        }
      });
  }

  private loadInventory(): void {

    this.inventoryService
      .getByHairDyeId(
        this.hairDyeId
      )
      .subscribe({

        next: inventory => {

          this.inventory.set(
            inventory
          );

          this.settingsForm.patchValue({

            unit:
              inventory.unit,

            lowStockThreshold: inventory.lowStockThreshold,
            reorderTargetQuantity: inventory.reorderTargetQuantity ?? inventory.lowStockThreshold * 2,
            preferredSupplierId: inventory.preferredSupplierId ?? 0
          });

          this.loadMovements();
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          if (
            error.status ===
            404
          ) {

            this.inventory.set(
              null
            );

            this.movements.set(
              []
            );

            this.loading.set(
              false
            );

            return;
          }

          this.loading.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare la giacenza.'
            )
          );
        }
      });
  }

  private loadMovements(): void {

    const current =
      this.inventory();

    if (
      !current?.id
    ) {

      this.movements.set(
        []
      );

      this.loading.set(
        false
      );

      return;
    }

    this.movementService
      .getByInventoryId(
        current.id
      )
      .subscribe({

        next: movements => {

          this.movements.set(
            movements ??
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
            this.getErrorMessage(
              error,
              'Impossibile caricare lo storico movimenti.'
            )
          );
        }
      });
  }

  protected createInventory(): void {

    if (
      this.initialForm.invalid
    ) {

      this.initialForm.markAllAsTouched();

      return;
    }

    const value =
      this.initialForm.getRawValue();

    const payload:
      HairDyeInventory = {

      hairDyeId:
        this.hairDyeId,

      quantityAvailable:
        Number(
          value.quantityAvailable
        ),

      unit:
        value.unit,

      lowStockThreshold: Number(value.lowStockThreshold),
      reorderTargetQuantity: Number(value.reorderTargetQuantity),
      preferredSupplierId: value.preferredSupplierId > 0 ? value.preferredSupplierId : null
    };

    this.loading.set(
      true
    );

    this.clearMessages();

    this.inventoryService
      .insert(
        payload
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Posizione di magazzino creata e movimento iniziale registrato.'
          );

          this.loadInventory();
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
              'Impossibile creare la giacenza.'
            )
          );
        }
      });
  }

  protected saveSettings(): void {

    const current =
      this.inventory();

    if (
      !current?.id
      ||
      this.settingsForm.invalid
    ) {

      this.settingsForm.markAllAsTouched();

      return;
    }

    const value =
      this.settingsForm.getRawValue();

    const payload:
      HairDyeInventory = {

      hairDyeId:
        this.hairDyeId,

      quantityAvailable:
        current.quantityAvailable,

      unit:
        value.unit,

      lowStockThreshold: Number(value.lowStockThreshold),
      reorderTargetQuantity: Number(value.reorderTargetQuantity),
      preferredSupplierId: value.preferredSupplierId > 0 ? value.preferredSupplierId : null
    };

    this.loading.set(
      true
    );

    this.clearMessages();

    this.inventoryService
      .update(
        current.id,
        payload
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Impostazioni magazzino aggiornate.'
          );

          this.loadInventory();
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
              'Impossibile aggiornare le impostazioni.'
            )
          );
        }
      });
  }

  protected createMovement(): void {

    const current =
      this.inventory();

    if (
      !current?.id
      ||
      this.movementForm.invalid
    ) {

      this.movementForm.markAllAsTouched();

      return;
    }

    const value =
      this.movementForm.getRawValue();

    const request:
      HairDyeInventoryMovementRequest = {

      movementType:
        value.movementType,

      quantity:
        Number(
          value.quantity
        ),

      referenceCode:
        value.referenceCode
          .trim() ||
        null,

      reason:
        value.reason
          .trim() ||
        null
    };

    this.savingMovement.set(
      true
    );

    this.clearMessages();

    this.movementService
      .create(
        current.id,
        request
      )
      .subscribe({

        next: () => {

          this.savingMovement.set(
            false
          );

          this.successMessage.set(
            'Movimento registrato correttamente.'
          );

          this.movementForm.patchValue({

            quantity:
              0,

            referenceCode:
              '',

            reason:
              ''
          });

          this.loadInventory();
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.savingMovement.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile registrare il movimento.'
            )
          );
        }
      });
  }

  protected isInventoryCount():
    boolean {

    return (
      this.movementForm.controls
        .movementType
        .value ===
      'INVENTORY_COUNT'
    );
  }

  protected getStockState():
    'OK' |
    'LOW' |
    'OUT' {

    const current =
      this.inventory();

    if (
      !current
      ||
      current.quantityAvailable <=
      0
    ) {

      return 'OUT';
    }

    if (
      current.quantityAvailable <=
      current.lowStockThreshold
    ) {

      return 'LOW';
    }

    return 'OK';
  }

  protected getStockStateLabel():
    string {

    switch (
      this.getStockState()
    ) {

      case 'OUT':
        return 'Esaurito';

      case 'LOW':
        return 'Scorta bassa';

      default:
        return 'Disponibile';
    }
  }

  protected getMovementSign(
    movement:
      HairDyeInventoryMovement
  ): string {

    if (
      movement.signedDelta >
      0
    ) {

      return '+';
    }

    return '';
  }

  protected goBack(): void {

    this.router.navigate(
      [
        '/color-lab'
      ],
      {
        queryParams: {
          tab:
            'inventory'
        }
      }
    );
  }

  private clearMessages(): void {

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );
  }

  private getErrorMessage(
    error:
      HttpErrorResponse,
    fallback:
      string
  ): string {

    const message =
      error.error?.message;

    return (
      typeof message ===
        'string'
      &&
      message.trim()
    )
      ? message
      : fallback;
  }
}
