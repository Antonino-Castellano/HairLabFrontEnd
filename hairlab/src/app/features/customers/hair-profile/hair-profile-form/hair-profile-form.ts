import { HttpErrorResponse } from '@angular/common/http';
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

import { HairProfile } from '../../../../models/hair-profile';
import { HairProfileService } from '../../../../service/hair-profile-service';

import { HairCondition } from '../../../../models/enums/hair-condition';
import { HairLength } from '../../../../models/enums/hair-length';
import { HairTexture } from '../../../../models/enums/hair-texture';
import { HairType } from '../../../../models/enums/hair-type';
import { PhysicalValue } from '../../../../models/enums/physical-value';
import { Reflection } from '../../../../models/enums/reflection';
import { ToneLevel } from '../../../../models/enums/tone-level';

import {
  HAIR_CONDITION_LABELS,
  HAIR_LENGTH_LABELS,
  HAIR_TEXTURE_LABELS,
  HAIR_TYPE_LABELS,
  PHYSICAL_VALUE_LABELS,
  REFLECTION_COLORS,
  REFLECTION_LABELS,
  TONE_LEVEL_COLORS,
  TONE_LEVEL_LABELS
} from '../hair-profile-display';

@Component({
  selector: 'app-hair-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './hair-profile-form.html',
  styleUrl: './hair-profile-form.css'
})
export class HairProfileFormComponent implements OnInit {
  /**
   * Servizio per costruire il Reactive Form.
   */
  private readonly formBuilder =
    inject(FormBuilder);

  /**
   * Service che comunica con Spring Boot.
   */
  private readonly hairProfileService =
    inject(HairProfileService);

  /**
   * Permette di leggere i parametri presenti nell'URL.
   */
  private readonly activatedRoute =
    inject(ActivatedRoute);

  /**
   * Permette di cambiare pagina dopo il salvataggio.
   */
  private readonly router =
    inject(Router);

  /**
   * ID del cliente proprietario del profilo.
   */
  protected customerId = 0;

  /**
   * ID del profilo.
   *
   * Esiste solamente quando stiamo modificando
   * un HairProfile già presente.
   */
  protected hairProfileId?: number;

  /**
   * true = modifica.
   * false = creazione.
   */
  protected readonly isEditMode =
    signal(false);

  /**
   * Stato di caricamento.
   */
  protected readonly loading =
    signal(false);

  /**
   * Eventuale messaggio di errore.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Array contenenti tutti i valori degli Enum.
   *
   * Servono per generare automaticamente
   * le opzioni nell'HTML.
   */
  protected readonly toneLevels =
    Object.values(ToneLevel);

  protected readonly reflections =
    Object.values(Reflection);

  protected readonly hairTypes =
    Object.values(HairType);

  protected readonly textures =
    Object.values(HairTexture);

  protected readonly physicalValues =
    Object.values(PhysicalValue);

  protected readonly hairConditions =
    Object.values(HairCondition);

  protected readonly hairLengths =
    Object.values(HairLength);

  /**
   * Traduzioni e colori utilizzati dal template.
   */
  protected readonly toneLevelLabels =
    TONE_LEVEL_LABELS;

  protected readonly toneLevelColors =
    TONE_LEVEL_COLORS;

  protected readonly reflectionLabels =
    REFLECTION_LABELS;

  protected readonly reflectionColors =
    REFLECTION_COLORS;

  protected readonly hairTypeLabels =
    HAIR_TYPE_LABELS;

  protected readonly hairTextureLabels =
    HAIR_TEXTURE_LABELS;

  protected readonly physicalValueLabels =
    PHYSICAL_VALUE_LABELS;

  protected readonly hairConditionLabels =
    HAIR_CONDITION_LABELS;

  protected readonly hairLengthLabels =
    HAIR_LENGTH_LABELS;

  /**
   * Reactive Form del profilo capelli.
   *
   * Gli array vengono gestiti temporaneamente
   * come testo nelle textarea.
   *
   * Al salvataggio il testo viene trasformato
   * in string[].
   */
  protected readonly hairProfileForm =
    this.formBuilder.nonNullable.group({
      naturalTone: [
        ToneLevel.LEVEL_5_LIGHT_BROWN,
        Validators.required
      ],

      currentTone: [
        ToneLevel.LEVEL_5_LIGHT_BROWN,
        Validators.required
      ],

      reflection: [
        Reflection.NATURAL,
        Validators.required
      ],

      hairType: [
        HairType.STRAIGHT,
        Validators.required
      ],

      texture: [
        HairTexture.MEDIUM,
        Validators.required
      ],

      hairLength: [
        HairLength.MEDIUM,
        Validators.required
      ],

      porosity: [
        PhysicalValue.MEDIUM,
        Validators.required
      ],

      density: [
        PhysicalValue.MEDIUM,
        Validators.required
      ],

      hairCondition: [
        HairCondition.HEALTHY,
        Validators.required
      ],

      scalpConditionText: [''],

      chemicalHistoryText: [''],

      sensitivitiesText: [''],

      contraindicationsText: [''],

      notes: ['']
    });

  /**
   * Legge i parametri della route.
   *
   * Creazione:
   * /customers/1/hair-profile/new
   *
   * Modifica:
   * /customers/1/hair-profile/2/edit
   */
  ngOnInit(): void {
    const customerIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('customerId');

    if (!customerIdParam) {
      this.errorMessage.set(
        'ID cliente non presente.'
      );

      return;
    }

    const customerId =
      Number(customerIdParam);

    if (
      Number.isNaN(customerId) ||
      customerId <= 0
    ) {
      this.errorMessage.set(
        'ID cliente non valido.'
      );

      return;
    }

    this.customerId =
      customerId;

    /**
     * profileId esiste soltanto
     * nella route di modifica.
     */
    const profileIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('profileId');

    if (!profileIdParam) {
      return;
    }

    const profileId =
      Number(profileIdParam);

    if (
      Number.isNaN(profileId) ||
      profileId <= 0
    ) {
      this.errorMessage.set(
        'ID profilo non valido.'
      );

      return;
    }

    this.hairProfileId =
      profileId;

    this.isEditMode.set(true);

    this.loadHairProfile(
      profileId
    );
  }

  /**
   * Recupera un profilo esistente
   * e precompila il form.
   */
  private loadHairProfile(
    id: number
  ): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.hairProfileService
      .getById(id)
      .subscribe({
        next: profile => {
          this.hairProfileForm.patchValue({
            naturalTone:
              profile.naturalTone,

            currentTone:
              profile.currentTone,

            reflection:
              profile.reflection,

            hairType:
              profile.hairType,

            texture:
              profile.texture,

            hairLength:
              profile.hairLength ??
              HairLength.MEDIUM,

            porosity:
              profile.porosity,

            density:
              profile.density,

            hairCondition:
              profile.hairCondition,

            scalpConditionText:
              this.arrayToText(
                profile.scalpCondition
              ),

            chemicalHistoryText:
              this.arrayToText(
                profile.chemicalHistory
              ),

            sensitivitiesText:
              this.arrayToText(
                profile.sensitivities
              ),

            contraindicationsText:
              this.arrayToText(
                profile.contraindications
              ),

            notes:
              profile.notes ?? ''
          });

          this.loading.set(false);
        },

        error: () => {
          this.errorMessage.set(
            'Impossibile caricare il profilo.'
          );

          this.loading.set(false);
        }
      });
  }

  /**
   * Esegue il salvataggio del form.
   *
   * Se siamo in modalità creazione:
   * POST
   *
   * Se siamo in modalità modifica:
   * PUT
   */
  protected submit(): void {
    if (
      this.hairProfileForm.invalid
    ) {
      this.hairProfileForm
        .markAllAsTouched();

      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue =
      this.hairProfileForm
        .getRawValue();

    /**
     * Costruiamo l'oggetto HairProfile
     * da inviare al backend.
     */
    const hairProfile: HairProfile = {
      customerId:
        this.customerId,

      naturalTone:
        formValue.naturalTone,

      currentTone:
        formValue.currentTone,

      reflection:
        formValue.reflection,

      hairType:
        formValue.hairType,

      texture:
        formValue.texture,

      hairLength:
        formValue.hairLength,

      porosity:
        formValue.porosity,

      density:
        formValue.density,

      hairCondition:
        formValue.hairCondition,

      scalpCondition:
        this.textToArray(
          formValue.scalpConditionText
        ),

      chemicalHistory:
        this.textToArray(
          formValue.chemicalHistoryText
        ),

      sensitivities:
        this.textToArray(
          formValue.sensitivitiesText
        ),

      contraindications:
        this.textToArray(
          formValue.contraindicationsText
        ),

      notes:
        formValue.notes.trim() || undefined
    };

    /**
     * UPDATE.
     */
    if (
      this.isEditMode() &&
      this.hairProfileId !== undefined
    ) {
      this.hairProfileService
        .update(
          this.hairProfileId,
          hairProfile
        )
        .subscribe({
          next: () => {
            this.goBackToCustomer();
          },

          error: (
            error: HttpErrorResponse
          ) => {
            this.handleError(
              error,
              'Impossibile modificare il profilo.'
            );
          }
        });

      return;
    }

    /**
     * CREATE.
     */
    this.hairProfileService
      .insert(hairProfile)
      .subscribe({
        next: () => {
          this.goBackToCustomer();
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.handleError(
            error,
            'Impossibile creare il profilo.'
          );
        }
      });
  }

  /**
   * Converte il contenuto delle textarea
   * in array di stringhe.
   *
   * Sono accettati sia:
   *
   * Cute secca
   * Cute sensibile
   *
   * sia:
   *
   * Cute secca, Cute sensibile
   */
  private textToArray(
    value: string
  ): string[] {
    return value
      .split(/[\n,]+/)
      .map(
        item => item.trim()
      )
      .filter(
        item => item.length > 0
      );
  }

  /**
   * Converte un array ricevuto dal backend
   * in testo utilizzabile nelle textarea.
   */
  private arrayToText(
    values: string[] | null | undefined
  ): string {
    return (
      values ?? []
    ).join('\n');
  }

  /**
   * Torna alla pagina del cliente.
   */
  private goBackToCustomer(): void {
    this.router.navigate([
      '/customers',
      this.customerId
    ]);
  }

  /**
   * Gestione centralizzata degli errori HTTP.
   */
  private handleError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): void {
    this.loading.set(false);

    if (error.status === 400) {
      this.errorMessage.set(
        'I dati inseriti non sono validi.'
      );
    } else if (
      error.status === 401
    ) {
      this.errorMessage.set(
        'Sessione scaduta.'
      );
    } else if (
      error.status === 403
    ) {
      this.errorMessage.set(
        'Non hai i permessi necessari.'
      );
    } else if (
      error.status === 0
    ) {
      this.errorMessage.set(
        'Impossibile comunicare con il backend.'
      );
    } else {
      this.errorMessage.set(
        defaultMessage
      );
    }
  }
}