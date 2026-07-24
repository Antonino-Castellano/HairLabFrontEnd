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
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  ColorFormulaDetail,
  ColorFormulaManagementRequest
} from '../../../models/color-formula-management';

import {
  Customer
} from '../../../models/customer';

import {
  HairDye
} from '../../../models/hair-dye';

import {
  HairDyeInventory
} from '../../../models/hair-dye-inventory';

import {
  ColorApplicationType
} from '../../../models/enums/color-application-type';

import {
  ColorFormulaStatus
} from '../../../models/enums/color-formula-status';

import {
  InventoryUnit
} from '../../../models/enums/inventory-unit';

import {
  MixingRatio
} from '../../../models/enums/mixing-ratio';

import {
  Oxygen
} from '../../../models/enums/oxygen';

import {
  ProductType
} from '../../../models/enums/product-type';

import {
  Reflection
} from '../../../models/enums/reflection';

import {
  ToneLevel
} from '../../../models/enums/tone-level';

import {
  ColorFormulaManagementService
} from '../../../service/color-formula-management-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  HairDyeInventoryService
} from '../../../service/hair-dye-inventory-service';

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
  PRODUCT_TYPE_LABELS,
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

type IngredientForm =
  FormGroup<{

    hairDyeId:
      FormControl<number | null>;

    quantity:
      FormControl<number>;

    notes:
      FormControl<string>;
  }>;

/**
 * Formula Builder manuale.
 *
 * È la stessa struttura che verrà
 * successivamente popolata
 * dallo Smart Formula Engine.
 */
@Component({
  selector:
    'app-color-formula-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl:
    './color-formula-builder.html',
  styleUrl:
    './color-formula-builder.css'
})
export class ColorFormulaBuilderComponent
  implements OnInit {

  private readonly formBuilder =
    inject(
      FormBuilder
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  private readonly hairDyeService =
    inject(
      HairDyeService
    );

  private readonly inventoryService =
    inject(
      HairDyeInventoryService
    );

  private readonly managementService =
    inject(
      ColorFormulaManagementService
    );

  private readonly activatedRoute =
    inject(
      ActivatedRoute
    );

  private readonly router =
    inject(
      Router
    );

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly products =
    signal<HairDye[]>([]);

  protected readonly inventories =
    signal<HairDyeInventory[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly isEditMode =
    signal(false);

  protected formulaId?:
    number;

  protected readonly toneLevels =
    Object.values(
      ToneLevel
    );

  protected readonly reflections =
    Object.values(
      Reflection
    );

  protected readonly applications =
    Object.values(
      ColorApplicationType
    );

  protected readonly oxygens =
    Object.values(
      Oxygen
    );

  protected readonly mixingRatios =
    Object.values(
      MixingRatio
    );

  /**
   * USED viene impostato esclusivamente dal workflow
   * "Utilizza formula" e non è più selezionabile manualmente.
   */
  protected readonly statuses = [
    ColorFormulaStatus.DRAFT,
    ColorFormulaStatus.PROPOSED
  ];

  protected readonly toneLabels =
    TONE_LEVEL_LABELS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  protected readonly applicationLabels =
    COLOR_APPLICATION_LABELS;

  protected readonly oxygenLabels =
    OXYGEN_LABELS;

  protected readonly mixingRatioLabels =
    MIXING_RATIO_LABELS;

  protected readonly statusLabels =
    COLOR_FORMULA_STATUS_LABELS;

  protected readonly productTypeLabels =
    PRODUCT_TYPE_LABELS;

  /**
   * Prodotti ammessi come ingredienti colore.
   *
   * Developer è gestito separatamente
   * da volume + rapporto.
   *
   * Treatment non appartiene alla miscela colore.
   */
  protected readonly formulaProducts =
    computed(
      () =>
        this.products()
          .filter(
            product =>
              product.active
              &&
              product.productType !==
                ProductType.DEVELOPER
              &&
              product.productType !==
                ProductType.TREATMENT
          )
          .sort(
            (
              first,
              second
            ) =>
              first.brand.localeCompare(
                second.brand,
                'it'
              )
              ||
              first.code.localeCompare(
                second.code,
                'it',
                {
                  numeric: true
                }
              )
          )
    );

  protected readonly form =
    this.formBuilder.group({

      customerId: [
        null as
          number |
          null,
        Validators.required
      ],

      /**
       * Contesto opzionale della consulenza
       * da cui nasce la formula.
       */
      consultationId: [
        null as
          number |
          null
      ],

      /**
       * Servizio specifico dell'appuntamento
       * al quale la formula è collegata.
       */
      appointmentItemId: [
        null as
          number |
          null
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(
            150
          )
        ]
      ],

      targetResult: [
        '',
        Validators.required
      ],

      targetToneLevel: [
        null as
          ToneLevel |
          null
      ],

      targetPrimaryReflection: [
        null as
          Reflection |
          null
      ],

      targetSecondaryReflection: [
        null as
          Reflection |
          null
      ],

      applicationType: [
        ColorApplicationType.FULL_HEAD,
        Validators.required
      ],

      volumeDeveloper: [
        Oxygen.VOL_10,
        Validators.required
      ],

      mixingRatio: [
        MixingRatio.RATIO_1_TO_1_5,
        Validators.required
      ],

      customDeveloperRatio: [
        1.5,
        [
          Validators.min(
            0.01
          )
        ]
      ],

      status: [
        ColorFormulaStatus.DRAFT,
        Validators.required
      ],

      notes: [
        ''
      ],

      ingredients:
        this.formBuilder.array<
          IngredientForm
        >([])
    });

  protected get ingredients():
    FormArray<IngredientForm> {

    return this.form.controls
      .ingredients;
  }

  ngOnInit(): void {

    const idParam =
      this.activatedRoute
        .snapshot
        .paramMap
        .get(
          'id'
        );

    if (
      idParam
    ) {

      const id =
        Number(
          idParam
        );

      if (
        !Number.isNaN(
          id
        )
        &&
        id >
        0
      ) {

        this.formulaId =
          id;

        this.isEditMode.set(
          true
        );
      }
    }

    this.loadData();
  }

  private loadData():
    void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    forkJoin({

      customers:
        this.customerService
          .getActive(),

      products:
        this.hairDyeService
          .getActive(),

      inventories:
        this.inventoryService
          .getAll()

    }).subscribe({

      next: result => {

        this.customers.set(
          result.customers ??
          []
        );

        this.products.set(
          result.products ??
          []
        );

        this.inventories.set(
          result.inventories ??
          []
        );

        if (
          this.isEditMode()
          &&
          this.formulaId
        ) {

          this.loadFormula(
            this.formulaId
          );

        } else {

          this.applySmartDiagnosisPreset();

          const suggestedIngredients =
            this.getSuggestedIngredientsFromQuery();

          if (
            suggestedIngredients.length >
            0
          ) {

            for (
              const suggested of
                suggestedIngredients
            ) {

              this.ingredients.push(
                this.createIngredientGroup(
                  suggested.hairDyeId,
                  suggested.quantity,
                  suggested.quantity >
                    0
                    ? 'Grammatura suggerita da Smart Formula'
                    : 'Dosaggio da completare manualmente'
                )
              );
            }

          } else {

            this.addIngredient();
          }

          this.loading.set(
            false
          );
        }
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
            'Impossibile inizializzare il Formula Builder.'
          )
        );
      }
    });
  }

  /**
   * Precompila il Builder quando arrivo
   * dalla Smart Diagnosis.
   *
   * Esempio:
   *
   * /color-lab/formulas/new
   * ?customerId=1
   * &targetToneLevel=LEVEL_7_MEDIUM_BLONDE
   * &targetPrimaryReflection=ASH
   */
  private applySmartDiagnosisPreset():
    void {

    const params =
      this.activatedRoute
        .snapshot
        .queryParamMap;

    const customerIdParam =
      params.get(
        'customerId'
      );

    if (
      customerIdParam
    ) {

      const customerId =
        Number(
          customerIdParam
        );

      const exists =
        this.customers()
          .some(
            customer =>
              customer.id ===
              customerId
          );

      if (
        exists
      ) {

        this.form.controls
          .customerId
          .setValue(
            customerId
          );
      }
    }

    const consultationIdParam =
      params.get(
        'consultationId'
      );

    if (consultationIdParam) {
      const consultationId = Number(consultationIdParam);

      if (Number.isInteger(consultationId) && consultationId > 0) {
        this.form.controls.consultationId.setValue(consultationId);
      }
    }

    const appointmentItemIdParam =
      params.get(
        'appointmentItemId'
      );

    if (appointmentItemIdParam) {
      const appointmentItemId = Number(appointmentItemIdParam);

      if (Number.isInteger(appointmentItemId) && appointmentItemId > 0) {
        this.form.controls.appointmentItemId.setValue(appointmentItemId);
      }
    }

    const targetTone =
      params.get(
        'targetToneLevel'
      ) as
        ToneLevel |
        null;

    if (
      targetTone
      &&
      Object.values(
        ToneLevel
      ).includes(
        targetTone
      )
    ) {

      this.form.controls
        .targetToneLevel
        .setValue(
          targetTone
        );
    }

    const primaryReflection =
      params.get(
        'targetPrimaryReflection'
      ) as
        Reflection |
        null;

    if (
      primaryReflection
      &&
      Object.values(
        Reflection
      ).includes(
        primaryReflection
      )
    ) {

      this.form.controls
        .targetPrimaryReflection
        .setValue(
          primaryReflection
        );
    }

    const secondaryReflection =
      params.get(
        'targetSecondaryReflection'
      ) as
        Reflection |
        null;

    if (
      secondaryReflection
      &&
      Object.values(
        Reflection
      ).includes(
        secondaryReflection
      )
    ) {

      this.form.controls
        .targetSecondaryReflection
        .setValue(
          secondaryReflection
        );
    }

    const applicationType =
      params.get(
        'applicationType'
      ) as
        ColorApplicationType |
        null;

    if (
      applicationType
      &&
      Object.values(
        ColorApplicationType
      ).includes(
        applicationType
      )
    ) {

      this.form.controls
        .applicationType
        .setValue(
          applicationType
        );
    }

    const targetResult =
      params.get(
        'targetResult'
      );

    if (
      targetResult
    ) {

      this.form.controls
        .targetResult
        .setValue(
          targetResult
        );
    }

    const volumeDeveloper =
      params.get(
        'volumeDeveloper'
      ) as
        Oxygen |
        null;

    if (
      volumeDeveloper
      &&
      Object.values(
        Oxygen
      ).includes(
        volumeDeveloper
      )
    ) {

      this.form.controls
        .volumeDeveloper
        .setValue(
          volumeDeveloper
        );
    }

    const mixingRatio =
      params.get(
        'mixingRatio'
      ) as
        MixingRatio |
        null;

    if (
      mixingRatio
      &&
      Object.values(
        MixingRatio
      ).includes(
        mixingRatio
      )
    ) {

      this.form.controls
        .mixingRatio
        .setValue(
          mixingRatio
        );
    }

    const customDeveloperRatioParam =
      params.get(
        'customDeveloperRatio'
      );

    if (
      mixingRatio ===
        MixingRatio.CUSTOM
      &&
      customDeveloperRatioParam
    ) {

      const customDeveloperRatio =
        Number(
          customDeveloperRatioParam
        );

      if (
        Number.isFinite(
          customDeveloperRatio
        )
        &&
        customDeveloperRatio >
        0
      ) {

        this.form.controls
          .customDeveloperRatio
          .setValue(
            customDeveloperRatio
          );
      }
    }
  }

  /**
   * Legge il piano ingredienti
   * generato dal Dosage Engine.
   *
   * Formato:
   *
   * ingredientPlan=4:35|8:15|12:0
   *
   * Una quantità 0 indica:
   * componente selezionato,
   * ma dosaggio da completare manualmente.
   */
  private getSuggestedIngredientsFromQuery():
    Array<{
      hairDyeId: number;
      quantity: number;
    }> {

    const raw =
      this.activatedRoute
        .snapshot
        .queryParamMap
        .get(
          'ingredientPlan'
        );

    if (
      !raw
    ) {

      return [];
    }

    const validProductIds =
      new Set(
        this.formulaProducts()
          .map(
            product =>
              product.id
          )
          .filter(
            (
              id
            ): id is number =>
              id != null
          )
      );

    const result:
      Array<{
        hairDyeId: number;
        quantity: number;
      }> = [];

    const alreadyAdded =
      new Set<number>();

    for (
      const token of
        raw.split(
          '|'
        )
    ) {

      const [
        idText,
        quantityText
      ] =
        token.split(
          ':'
        );

      const hairDyeId =
        Number(
          idText
        );

      const quantity =
        Number(
          quantityText
        );

      if (
        !Number.isInteger(
          hairDyeId
        )
        ||
        hairDyeId <=
        0
        ||
        !validProductIds.has(
          hairDyeId
        )
        ||
        alreadyAdded.has(
          hairDyeId
        )
      ) {

        continue;
      }

      alreadyAdded.add(
        hairDyeId
      );

      result.push({

        hairDyeId,

        quantity:
          Number.isFinite(
            quantity
          )
          &&
          quantity >
          0

            ? quantity

            : 0
      });
    }

    return result;
  }


  private loadFormula(
    id:
      number
  ): void {

    this.managementService
      .getById(
        id
      )
      .subscribe({

        next: detail => {

          const formula =
            detail.formula;

          this.form.patchValue({

            customerId:
              formula.customerId ??
              null,

            consultationId:
              formula.consultationId ??
              null,

            appointmentItemId:
              formula.appointmentItemId ??
              null,

            name:
              formula.name,

            targetResult:
              formula.targetResult,

            targetToneLevel:
              formula.targetToneLevel ??
              null,

            targetPrimaryReflection:
              formula.targetPrimaryReflection ??
              null,

            targetSecondaryReflection:
              formula.targetSecondaryReflection ??
              null,

            applicationType:
              formula.applicationType ??
              ColorApplicationType.FULL_HEAD,

            volumeDeveloper:
              formula.volumeDeveloper,

            mixingRatio:
              formula.mixingRatio,

            customDeveloperRatio:
              formula.customDeveloperRatio ??
              1.5,

            status:
              formula.status,

            notes:
              formula.notes ??
              ''
          });

          this.ingredients.clear();

          for (
            const item of
              detail.ingredients
          ) {

            this.ingredients.push(
              this.createIngredientGroup(
                item.hairDyeId,
                item.quantity,
                item.notes ??
                ''
              )
            );
          }

          if (
            this.ingredients.length ===
            0
          ) {

            this.addIngredient();
          }

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
              'Impossibile caricare la formula.'
            )
          );
        }
      });
  }

  protected addIngredient():
    void {

    this.ingredients.push(
      this.createIngredientGroup()
    );
  }

  protected removeIngredient(
    index:
      number
  ): void {

    if (
      this.ingredients.length <=
      1
    ) {

      return;
    }

    this.ingredients.removeAt(
      index
    );
  }

  private createIngredientGroup(
    hairDyeId:
      number |
      null =
        null,
    quantity =
      0,
    notes =
      ''
  ): IngredientForm {

    return this.formBuilder.group({

      hairDyeId:
        this.formBuilder.control<
          number |
          null
        >(
          hairDyeId,
          {
            validators: [
              Validators.required
            ]
          }
        ),

      quantity:
        this.formBuilder.nonNullable.control(
          quantity,
          {
            validators: [
              Validators.required,
              Validators.min(
                0.01
              )
            ]
          }
        ),

      notes:
        this.formBuilder.nonNullable.control(
          notes
        )
    });
  }

  /**
   * Totale ingredienti pesati.
   */
  protected getTotalColorQuantity():
    number {

    return this.round2(
      this.ingredients.controls
        .reduce(
          (
            total,
            group
          ) =>
            total +
            Number(
              group.controls
                .quantity
                .value ||
              0
            ),
          0
        )
    );
  }

  protected getDeveloperRatio():
    number {

    switch (
      this.form.controls
        .mixingRatio
        .value
    ) {

      case MixingRatio.RATIO_1_TO_1:
        return 1;

      case MixingRatio.RATIO_1_TO_1_5:
        return 1.5;

      case MixingRatio.RATIO_1_TO_2:
        return 2;

      case MixingRatio.RATIO_1_TO_3:
        return 3;

      case MixingRatio.CUSTOM:
        return Math.max(
          0,
          Number(
            this.form.controls
              .customDeveloperRatio
              .value ||
            0
          )
        );

      default:
        return 0;
    }
  }

  protected getDeveloperQuantity():
    number {

    return this.round2(
      this.getTotalColorQuantity()
      *
      this.getDeveloperRatio()
    );
  }

  protected getTotalMixture():
    number {

    return this.round2(
      this.getTotalColorQuantity()
      +
      this.getDeveloperQuantity()
    );
  }

  protected isCustomRatio():
    boolean {

    return (
      this.form.controls
        .mixingRatio
        .value ===
      MixingRatio.CUSTOM
    );
  }

  protected getProductById(
    id:
      number |
      null
  ):
    HairDye |
    undefined {

    if (
      id == null
    ) {

      return undefined;
    }

    return this.products()
      .find(
        product =>
          product.id ===
          Number(
            id
          )
      );
  }

  protected getInventoryByProductId(
    id:
      number |
      null
  ):
    HairDyeInventory |
    undefined {

    if (
      id == null
    ) {

      return undefined;
    }

    return this.inventories()
      .find(
        inventory =>
          inventory.hairDyeId ===
          Number(
            id
          )
      );
  }

  protected getStockMessage(
    index:
      number
  ): string {

    const group =
      this.ingredients.at(
        index
      );

    const productId =
      group.controls
        .hairDyeId
        .value;

    const quantity =
      Number(
        group.controls
          .quantity
          .value ||
        0
      );

    if (
      !productId
    ) {

      return 'Seleziona un prodotto';
    }

    const inventory =
      this.getInventoryByProductId(
        productId
      );

    if (
      !inventory
    ) {

      return 'Giacenza non configurata';
    }

    if (
      inventory.unit !==
      InventoryUnit.GRAM
    ) {

      return (
        `Stock registrato in ${inventory.unit}; verifica manualmente`
      );
    }

    if (
      inventory.quantityAvailable <
      quantity
    ) {

      return (
        `Insufficiente · disponibili ${inventory.quantityAvailable} g`
      );
    }

    return (
      `Disponibili ${inventory.quantityAvailable} g`
    );
  }

  protected getStockState(
    index:
      number
  ):
    'OK' |
    'WARNING' |
    'NONE' {

    const group =
      this.ingredients.at(
        index
      );

    const productId =
      group.controls
        .hairDyeId
        .value;

    if (
      !productId
    ) {

      return 'NONE';
    }

    const inventory =
      this.getInventoryByProductId(
        productId
      );

    if (
      !inventory
      ||
      inventory.unit !==
        InventoryUnit.GRAM
    ) {

      return 'WARNING';
    }

    return (
      inventory.quantityAvailable >=
      Number(
        group.controls
          .quantity
          .value ||
        0
      )
    )
      ? 'OK'
      : 'WARNING';
  }

  protected hasDuplicateProducts():
    boolean {

    const ids =
      this.ingredients.controls
        .map(
          group =>
            group.controls
              .hairDyeId
              .value
        )
        .filter(
          (
            value
          ): value is number =>
            value != null
        );

    return (
      new Set(
        ids
      ).size !==
      ids.length
    );
  }

  protected submit():
    void {

    this.errorMessage.set(
      ''
    );

    if (
      this.form.invalid
      ||
      this.ingredients.invalid
    ) {

      this.form.markAllAsTouched();

      this.errorMessage.set(
        'Completa tutti i campi obbligatori della formula.'
      );

      return;
    }

    if (
      this.hasDuplicateProducts()
    ) {

      this.errorMessage.set(
        'Lo stesso prodotto tecnico non può comparire due volte.'
      );

      return;
    }

    if (
      this.isCustomRatio()
      &&
      this.getDeveloperRatio() <=
      0
    ) {

      this.errorMessage.set(
        'Inserisci un rapporto developer personalizzato maggiore di zero.'
      );

      return;
    }

    const value =
      this.form.getRawValue();

    const request:
      ColorFormulaManagementRequest = {

      customerId:
        Number(
          value.customerId
        ),

      consultationId:
        value.consultationId !=
          null

          ? Number(
              value.consultationId
            )

          : undefined,

      appointmentItemId:
        value.appointmentItemId !=
          null

          ? Number(
              value.appointmentItemId
            )

          : undefined,

      name:
        value.name?.trim() ??
        '',

      targetResult:
        value.targetResult?.trim() ??
        '',

      targetToneLevel:
        value.targetToneLevel ??
        null,

      targetPrimaryReflection:
        value.targetPrimaryReflection ??
        null,

      targetSecondaryReflection:
        value.targetSecondaryReflection ??
        null,

      applicationType:
        value.applicationType ??
        ColorApplicationType.FULL_HEAD,

      volumeDeveloper:
        value.volumeDeveloper ??
        Oxygen.VOL_10,

      mixingRatio:
        value.mixingRatio ??
        MixingRatio.RATIO_1_TO_1_5,

      customDeveloperRatio:
        this.isCustomRatio()
          ? this.getDeveloperRatio()
          : null,

      status:
        value.status ??
        ColorFormulaStatus.DRAFT,

      notes:
        value.notes?.trim() ??
        '',

      ingredients:
        this.ingredients.controls
          .map(
            group => ({

              hairDyeId:
                Number(
                  group.controls
                    .hairDyeId
                    .value
                ),

              quantity:
                Number(
                  group.controls
                    .quantity
                    .value
                ),

              unit:
                InventoryUnit.GRAM,

              notes:
                group.controls
                  .notes
                  .value
                  .trim()
            })
          )
    };

    this.saving.set(
      true
    );

    const request$ =
      this.isEditMode()
      &&
      this.formulaId

        ? this.managementService
            .update(
              this.formulaId,
              request
            )

        : this.managementService
            .create(
              request
            );

    request$.subscribe({

      next: detail => {

        this.saving.set(
          false
        );

        this.router.navigate(
          [
            '/color-lab/formulas',
            detail.formula.id
          ]
        );
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.saving.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile salvare la formula.'
          )
        );
      }
    });
  }

  private round2(
    value:
      number
  ): number {

    return (
      Math.round(
        (
          value +
          Number.EPSILON
        ) *
        100
      )
      /
      100
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
