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
  RouterLink
} from '@angular/router';

import {
  Customer
} from '../../../models/customer';

import {
  HairProfile
} from '../../../models/hair-profile';

import {
  ColorSmartDiagnosis,
  ColorSmartDiagnosisRequest
} from '../../../models/color-smart-diagnosis';

import {
  ColorSmartFormulaProposal,
  ColorSmartFormulaResponse
} from '../../../models/color-smart-formula';

import {
  ColorSmartHistoryInsight
} from '../../../models/color-smart-history-insight';

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
  ColorSmartFormulaService
} from '../../../service/color-smart-formula-service';

import {
  ColorSmartHistoryInsightService
} from '../../../service/color-smart-history-insight-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  HairProfileService
} from '../../../service/hair-profile-service';

import { ColorLabSectionNavComponent } from '../color-lab-section-nav/color-lab-section-nav';

import {
  COLOR_APPLICATION_LABELS
} from '../color-formula-display';

import {
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS
} from '../color-lab-display';

import {
  COLOR_FORMULA_COMPONENT_ROLE_LABELS
} from './color-smart-formula-display';

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
    RouterLink,
    ColorLabSectionNavComponent
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

  private readonly activatedRoute =
    inject(
      ActivatedRoute
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


  private readonly smartFormulaService =
    inject(
      ColorSmartFormulaService
    );


  private readonly historyInsightService =
    inject(
      ColorSmartHistoryInsightService
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


  protected readonly formulaResponse =
    signal<ColorSmartFormulaResponse | null>(
      null
    );


  /** Suggerimento colore HairLab da cui è stato aperto Smart Formula. */
  protected readonly sourceRecommendation =
    signal<{
      customerId: number;
      code: string;
      title: string;
      compatibilityScore: number | null;
    } | null>(null);


  /**
   * Contesto tecnico storico.
   *
   * Non modifica automaticamente
   * la formula proposta.
   */
  protected readonly historyInsight =
    signal<ColorSmartHistoryInsight | null>(
      null
    );

  protected readonly loadingHistoryInsight =
    signal(false);

  protected readonly proposing =
    signal(false);

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


  protected readonly componentRoleLabels =
    COLOR_FORMULA_COMPONENT_ROLE_LABELS;

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

          this.applyContextFromQuery();

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

  private applyContextFromQuery():
    void {

    const params =
      this.activatedRoute.snapshot.queryParamMap;

    const customerId =
      Number(
        params.get('customerId')
      );

    if (
      !Number.isInteger(customerId)
      || customerId <= 0
      || !this.customers().some(customer => customer.id === customerId)
    ) {
      return;
    }

    this.form.controls.customerId.setValue(customerId);

    const targetTone =
      params.get('targetToneLevel') as ToneLevel | null;

    if (targetTone && Object.values(ToneLevel).includes(targetTone)) {
      this.form.controls.targetToneLevel.setValue(targetTone);
    }

    const primary =
      params.get('targetPrimaryReflection') as Reflection | null;

    if (primary && Object.values(Reflection).includes(primary)) {
      this.form.controls.targetPrimaryReflection.setValue(primary);
    }

    const secondary =
      params.get('targetSecondaryReflection') as Reflection | null;

    if (secondary && Object.values(Reflection).includes(secondary)) {
      this.form.controls.targetSecondaryReflection.setValue(secondary);
    }

    const application =
      params.get('applicationType') as ColorApplicationType | null;

    if (application && Object.values(ColorApplicationType).includes(application)) {
      this.form.controls.applicationType.setValue(application);
    }

    const targetResult = params.get('targetResult');
    if (targetResult) {
      this.form.controls.targetResult.setValue(targetResult);
    }

    const code = params.get('sourceRecommendationCode');
    const title = params.get('sourceRecommendationTitle');
    const scoreValue = Number(params.get('sourceRecommendationCompatibilityScore'));

    if (code && title) {
      this.sourceRecommendation.set({
        customerId,
        code,
        title,
        compatibilityScore:
          Number.isFinite(scoreValue) ? scoreValue : null
      });
    }

    this.onCustomerChange();
  }

  protected getConsultationIdFromContext():
    number | null {

    const value =
      Number(
        this.activatedRoute.snapshot.queryParamMap.get('consultationId')
      );

    return Number.isInteger(value) && value > 0
      ? value
      : null;
  }

  protected getAppointmentItemIdFromContext():
    number | null {

    const value =
      Number(
        this.activatedRoute.snapshot.queryParamMap.get('appointmentItemId')
      );

    return Number.isInteger(value) && value > 0
      ? value
      : null;
  }

  protected onCustomerChange():
    void {

    this.diagnosis.set(
      null
    );

    this.formulaResponse.set(
      null
    );

    this.selectedProfile.set(
      null
    );

    this.historyInsight.set(
      null
    );

    this.errorMessage.set(
      ''
    );

    const customerId =
      this.form.controls
        .customerId
        .value;


    const source =
      this.sourceRecommendation();

    if (
      source
      && customerId
      && source.customerId !== customerId
    ) {
      this.sourceRecommendation.set(null);
    }

    if (
      !customerId
    ) {

      return;
    }

    this.loadHistoryInsight(
      customerId
    );

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

  /**
   * Carica i pattern ricavati dai risultati reali
   * delle precedenti formule USED.
   *
   * Un eventuale errore in questo endpoint
   * NON blocca la Smart Formula.
   */
  private loadHistoryInsight(
    customerId:
      number
  ): void {

    this.loadingHistoryInsight.set(
      true
    );

    this.historyInsightService
      .getByCustomerId(
        customerId
      )
      .subscribe({

        next: insight => {

          this.historyInsight.set(
            insight
          );

          this.loadingHistoryInsight.set(
            false
          );
        },

        error: () => {

          /*
           * Lo storico è un supporto aggiuntivo:
           * non deve impedire diagnosi e formula.
           */
          this.historyInsight.set(
            null
          );

          this.loadingHistoryInsight.set(
            false
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

    this.formulaResponse.set(
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

    this.analyzing.set(
      true
    );

    this.diagnosisService
      .analyze(
        this.buildRequest()
      )
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

  /**
   * Genera la proposta di prodotti
   * partendo dagli stessi input
   * usati dalla diagnosi.
   */
  protected generateProductProposal():
    void {

    if (
      !this.diagnosis()
      ||
      this.form.invalid
    ) {

      return;
    }

    this.proposing.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.smartFormulaService
      .propose(
        this.buildRequest()
      )
      .subscribe({

        next: response => {

          this.formulaResponse.set(
            response
          );

          /*
           * La response contiene di nuovo la diagnosi:
           * la manteniamo sincronizzata
           * con la versione usata dal motore formula.
           */
          this.diagnosis.set(
            response.diagnosis
          );

          this.proposing.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.proposing.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile generare la proposta prodotti.'
            )
          );
        }
      });
  }

  /**
   * Costruisce l'input comune
   * per diagnosi e proposta formula.
   */
  private buildRequest():
    ColorSmartDiagnosisRequest {

    const value =
      this.form.getRawValue();

    return {

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
        '',

      sourceRecommendationCode:
        this.sourceRecommendation()?.code ?? null,

      sourceRecommendationTitle:
        this.sourceRecommendation()?.title ?? null,

      sourceRecommendationCompatibilityScore:
        this.sourceRecommendation()?.compatibilityScore ?? null
    };
  }

  /**
   * Serializza il piano ingredienti
   * per precompilare il Formula Builder.
   *
   * Formato:
   *
   * id:grammi|id:grammi
   *
   * Esempio:
   *
   * 4:35|8:15|12:0
   *
   * Un correttore con dosaggio manuale
   * entra con quantità 0,
   * così il Builder obbliga il professionista
   * a completare il valore prima del salvataggio.
   */
  protected getIngredientPlan(
    proposal:
      ColorSmartFormulaProposal
  ): string {

    return proposal.components
      .map(
        component =>
          `${component.hairDyeId}:${component.recommendedQuantity ?? 0}`
      )
      .join(
        '|'
      );
  }

  protected getShortageLabel(
    shortage:
      number |
      null |
      undefined
  ): string {

    if (
      shortage == null
    ) {

      return 'non verificabile';
    }

    return `${shortage} g`;
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
