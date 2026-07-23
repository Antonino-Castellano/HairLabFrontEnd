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
  RouterLink
} from '@angular/router';

import {
  Customer
} from '../../../models/customer';

import {
  HairProfile
} from '../../../models/hair-profile';

import {
  ColorSmartDiagnosis
} from '../../../models/color-smart-diagnosis';

import {
  ColorApplicationType
} from '../../../models/enums/color-application-type';

import {
  Reflection
} from '../../../models/enums/reflection';

import {
  ToneLevel
} from '../../../models/enums/tone-level';

import {
  ColorSmartDiagnosisService
} from '../../../service/color-smart-diagnosis-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  HairProfileService
} from '../../../service/hair-profile-service';

import {
  COLOR_APPLICATION_LABELS
} from '../color-formula-display';

import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

import {
  COLOR_DIAGNOSIS_FEASIBILITY_LABELS,
  COLOR_DIAGNOSIS_STRATEGY_LABELS,
  HAIR_CONDITION_LABELS_SMART,
  HAIR_LENGTH_LABELS_SMART,
  HAIR_TEXTURE_LABELS_SMART,
  PHYSICAL_VALUE_LABELS_SMART
} from './color-smart-diagnosis-display';

/**
 * UI della Smart Formula - Fase 1.
 *
 * Non genera ancora ingredienti.
 *
 * Confronta il Profilo Capelli reale
 * con l'obiettivo selezionato
 * e mostra diagnosi e strategia.
 */
@Component({
  selector:
    'app-color-smart-diagnosis',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl:
    './color-smart-diagnosis.html',
  styleUrl:
    './color-smart-diagnosis.css'
})
export class ColorSmartDiagnosisComponent
  implements OnInit {

  private readonly formBuilder =
    inject(
      FormBuilder
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  private readonly hairProfileService =
    inject(
      HairProfileService
    );

  private readonly diagnosisService =
    inject(
      ColorSmartDiagnosisService
    );

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly selectedProfile =
    signal<HairProfile | null>(
      null
    );

  protected readonly diagnosis =
    signal<ColorSmartDiagnosis | null>(
      null
    );

  protected readonly loadingCustomers =
    signal(false);

  protected readonly loadingProfile =
    signal(false);

  protected readonly analyzing =
    signal(false);

  protected readonly errorMessage =
    signal('');

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

  protected readonly toneLabels =
    TONE_LEVEL_LABELS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  protected readonly applicationLabels =
    COLOR_APPLICATION_LABELS;

  protected readonly feasibilityLabels =
    COLOR_DIAGNOSIS_FEASIBILITY_LABELS;

  protected readonly strategyLabels =
    COLOR_DIAGNOSIS_STRATEGY_LABELS;

  protected readonly hairConditionLabels =
    HAIR_CONDITION_LABELS_SMART;

  protected readonly hairLengthLabels =
    HAIR_LENGTH_LABELS_SMART;

  protected readonly hairTextureLabels =
    HAIR_TEXTURE_LABELS_SMART;

  protected readonly physicalValueLabels =
    PHYSICAL_VALUE_LABELS_SMART;

  protected readonly form =
    this.formBuilder.group({

      customerId: [
        null as
          number |
          null,
        Validators.required
      ],

      targetToneLevel: [
        null as
          ToneLevel |
          null,
        Validators.required
      ],

      targetPrimaryReflection: [
        null as
          Reflection |
          null,
        Validators.required
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

      targetResult: [
        ''
      ]
    });

  ngOnInit(): void {

    this.loadCustomers();
  }

  private loadCustomers():
    void {

    this.loadingCustomers.set(
      true
    );

    this.customerService
      .getActive()
      .subscribe({

        next: customers => {

          this.customers.set(
            customers ??
            []
          );

          this.loadingCustomers.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loadingCustomers.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare i clienti.'
            )
          );
        }
      });
  }

  protected onCustomerChange():
    void {

    this.diagnosis.set(
      null
    );

    this.selectedProfile.set(
      null
    );

    this.errorMessage.set(
      ''
    );

    const customerId =
      this.form.controls
        .customerId
        .value;

    if (
      !customerId
    ) {

      return;
    }

    this.loadingProfile.set(
      true
    );

    this.hairProfileService
      .getByCustomerId(
        customerId
      )
      .subscribe({

        next: profile => {

          this.selectedProfile.set(
            profile
          );

          this.loadingProfile.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loadingProfile.set(
            false
          );

          if (
            error.status ===
            404
          ) {

            this.errorMessage.set(
              'Il cliente non possiede ancora un Profilo Capelli. '
              + 'Compilalo prima di usare Smart Formula.'
            );

            return;
          }

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare il Profilo Capelli.'
            )
          );
        }
      });
  }

  protected analyze():
    void {

    this.errorMessage.set(
      ''
    );

    this.diagnosis.set(
      null
    );

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      this.errorMessage.set(
        'Seleziona cliente, tono target, riflesso e applicazione.'
      );

      return;
    }

    if (
      !this.selectedProfile()
    ) {

      this.errorMessage.set(
        'Il Profilo Capelli del cliente è necessario per l’analisi.'
      );

      return;
    }

    const value =
      this.form.getRawValue();

    this.analyzing.set(
      true
    );

    this.diagnosisService
      .analyze({

        customerId:
          Number(
            value.customerId
          ),

        targetToneLevel:
          value.targetToneLevel!,

        targetPrimaryReflection:
          value.targetPrimaryReflection!,

        targetSecondaryReflection:
          value.targetSecondaryReflection ??
          null,

        applicationType:
          value.applicationType!,

        targetResult:
          value.targetResult?.trim() ??
          ''

      })
      .subscribe({

        next: result => {

          this.diagnosis.set(
            result
          );

          this.analyzing.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.analyzing.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile completare l’analisi.'
            )
          );
        }
      });
  }

  protected getCustomerName():
    string {

    const customerId =
      this.form.controls
        .customerId
        .value;

    const customer =
      this.customers()
        .find(
          item =>
            item.id ===
            customerId
        );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : 'Cliente';
  }

  protected getToneDifferenceLabel(
    difference:
      number
  ): string {

    if (
      difference ===
      0
    ) {

      return 'Stessa altezza di tono';
    }

    if (
      difference >
      0
    ) {

      return (
        `+${difference} livello/i · schiarire`
      );
    }

    return (
      `${difference} livello/i · scurire`
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
