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

import {
  ChinProjection,
  ChinShape,
  EyeColor,
  EyeOrientation,
  EyeShape,
  EyeSpacing,
  EyebrowShape,
  FaceLength,
  FaceLevel,
  FaceShape,
  FaceSize,
  FaceThickness,
  FaceWidth,
  HairlineShape,
  JawShape,
  LipBalance,
  LipFullness,
  LipShape,
  NoseProfile,
  NoseTip
} from '../../../../models/enums/face-profile-enums';

import {
  getProfileEnumLabel
} from '../../../../models/enums/profile-enum-labels';

import {
  CHIN_SHAPE_VISUALS,
  EYE_COLOR_VISUALS,
  EYE_ORIENTATION_VISUALS,
  EYE_SHAPE_VISUALS,
  EYEBROW_SHAPE_VISUALS,
  FACE_SHAPE_VISUALS,
  JAW_SHAPE_VISUALS,
  LIP_SHAPE_VISUALS,
  NOSE_PROFILE_VISUALS,
  ProfileVisualReference,
  getVisualReference
} from '../../../../models/enums/profile-visual-references';

import {
  FaceProfile
} from '../../../../models/face-profile';

import {
  FaceProfileService
} from '../../../../service/face-profile-service';

import {
  ProfileVisualIconComponent
} from '../../../../shared/profile-visual/profile-visual-icon';

/**
 * Form completo di analisi morfologica del viso.
 *
 * Utilizzato sia per:
 *
 * - creare un nuovo FaceProfile;
 * - modificare un FaceProfile esistente.
 *
 * Le rappresentazioni morfologiche
 * utilizzano ora icone SVG lineari
 * coerenti con lo stile della sidebar HairLab.
 */
@Component({
  selector: 'app-face-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ProfileVisualIconComponent
  ],
  templateUrl: './face-profile-form.html',
  styleUrl: './face-profile-form.css'
})
export class FaceProfileFormComponent
    implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly faceProfileService =
    inject(FaceProfileService);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected customerId?: number;

  protected profileId?: number;

  protected readonly isEditMode =
    signal(false);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  /*
   * ============================================================
   * ENUM
   * ============================================================
   */

  protected readonly faceShapes =
    Object.values(FaceShape);

  protected readonly levels =
    Object.values(FaceLevel);

  protected readonly widths =
    Object.values(FaceWidth);

  protected readonly lengths =
    Object.values(FaceLength);

  protected readonly sizes =
    Object.values(FaceSize);

  protected readonly thicknesses =
    Object.values(FaceThickness);

  protected readonly hairlineShapes =
    Object.values(HairlineShape);

  protected readonly eyeShapes =
    Object.values(EyeShape);

  protected readonly eyeOrientations =
    Object.values(EyeOrientation);

  protected readonly eyeSpacings =
    Object.values(EyeSpacing);

  protected readonly eyeColors =
    Object.values(EyeColor);

  protected readonly eyebrowShapes =
    Object.values(EyebrowShape);

  protected readonly noseProfiles =
    Object.values(NoseProfile);

  protected readonly noseTips =
    Object.values(NoseTip);

  protected readonly jawShapes =
    Object.values(JawShape);

  protected readonly chinShapes =
    Object.values(ChinShape);

  protected readonly chinProjections =
    Object.values(ChinProjection);

  protected readonly lipFullnessValues =
    Object.values(LipFullness);

  protected readonly lipBalances =
    Object.values(LipBalance);

  protected readonly lipShapes =
    Object.values(LipShape);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  protected readonly faceForm =
    this.formBuilder.group({

      faceShape:
        this.formBuilder.control<
          FaceShape | null
        >(
          null,
          Validators.required
        ),

      foreheadHeight:
        this.formBuilder.control<
          FaceLevel | null
        >(null),

      foreheadWidth:
        this.formBuilder.control<
          FaceWidth | null
        >(null),

      hairlineShape:
        this.formBuilder.control<
          HairlineShape | null
        >(null),

      eyeShape:
        this.formBuilder.control<
          EyeShape | null
        >(null),

      eyeOrientation:
        this.formBuilder.control<
          EyeOrientation | null
        >(null),

      eyeSpacing:
        this.formBuilder.control<
          EyeSpacing | null
        >(null),

      eyeSize:
        this.formBuilder.control<
          FaceSize | null
        >(null),

      eyeColor:
        this.formBuilder.control<
          EyeColor | null
        >(null),

      eyeReferenceColor:
        this.formBuilder.control<string>(
          '#6A4634'
        ),

      eyeColorNotes:
        this.formBuilder.control<string>(
          ''
        ),

      eyebrowShape:
        this.formBuilder.control<
          EyebrowShape | null
        >(null),

      eyebrowThickness:
        this.formBuilder.control<
          FaceThickness | null
        >(null),

      noseLength:
        this.formBuilder.control<
          FaceLength | null
        >(null),

      noseWidth:
        this.formBuilder.control<
          FaceWidth | null
        >(null),

      noseProfile:
        this.formBuilder.control<
          NoseProfile | null
        >(null),

      noseTip:
        this.formBuilder.control<
          NoseTip | null
        >(null),

      cheekboneWidth:
        this.formBuilder.control<
          FaceWidth | null
        >(null),

      cheekboneProminence:
        this.formBuilder.control<
          FaceLevel | null
        >(null),

      jawWidth:
        this.formBuilder.control<
          FaceWidth | null
        >(null),

      jawDefinition:
        this.formBuilder.control<
          FaceLevel | null
        >(null),

      jawShape:
        this.formBuilder.control<
          JawShape | null
        >(null),

      chinShape:
        this.formBuilder.control<
          ChinShape | null
        >(null),

      chinProjection:
        this.formBuilder.control<
          ChinProjection | null
        >(null),

      mouthWidth:
        this.formBuilder.control<
          FaceWidth | null
        >(null),

      lipFullness:
        this.formBuilder.control<
          LipFullness | null
        >(null),

      lipBalance:
        this.formBuilder.control<
          LipBalance | null
        >(null),

      lipShape:
        this.formBuilder.control<
          LipShape | null
        >(null),

      notes:
        this.formBuilder.control<string>(
          ''
        ),

      stylingGoals:
        this.formBuilder.control<string>(
          ''
        )
    });

  ngOnInit(): void {

    const customerIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('customerId');

    const profileIdParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('profileId');

    if (!customerIdParam) {

      this.errorMessage.set(
        'ID cliente mancante.'
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

    if (profileIdParam) {

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

      this.profileId =
        profileId;

      this.isEditMode.set(
        true
      );

      this.loadProfile(
        profileId
      );
    }
  }

  private loadProfile(
    profileId: number
  ): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.faceProfileService
      .getById(profileId)
      .subscribe({

        next: profile => {

          this.faceForm.patchValue({

            faceShape:
              profile.faceShape ?? null,

            foreheadHeight:
              profile.foreheadHeight ?? null,

            foreheadWidth:
              profile.foreheadWidth ?? null,

            hairlineShape:
              profile.hairlineShape ?? null,

            eyeShape:
              profile.eyeShape ?? null,

            eyeOrientation:
              profile.eyeOrientation ?? null,

            eyeSpacing:
              profile.eyeSpacing ?? null,

            eyeSize:
              profile.eyeSize ?? null,

            eyeColor:
              profile.eyeColor ?? null,

            eyeReferenceColor:
              profile.eyeReferenceColor ??
              this.getDefaultEyeColor(
                profile.eyeColor
              ),

            eyeColorNotes:
              profile.eyeColorNotes ?? '',

            eyebrowShape:
              profile.eyebrowShape ?? null,

            eyebrowThickness:
              profile.eyebrowThickness ?? null,

            noseLength:
              profile.noseLength ?? null,

            noseWidth:
              profile.noseWidth ?? null,

            noseProfile:
              profile.noseProfile ?? null,

            noseTip:
              profile.noseTip ?? null,

            cheekboneWidth:
              profile.cheekboneWidth ?? null,

            cheekboneProminence:
              profile.cheekboneProminence ?? null,

            jawWidth:
              profile.jawWidth ?? null,

            jawDefinition:
              profile.jawDefinition ?? null,

            jawShape:
              profile.jawShape ?? null,

            chinShape:
              profile.chinShape ?? null,

            chinProjection:
              profile.chinProjection ?? null,

            mouthWidth:
              profile.mouthWidth ?? null,

            lipFullness:
              profile.lipFullness ?? null,

            lipBalance:
              profile.lipBalance ?? null,

            lipShape:
              profile.lipShape ?? null,

            notes:
              profile.notes ?? '',

            stylingGoals:
              profile.stylingGoals ?? ''
          });

          this.loading.set(false);
        },

        error: () => {

          this.errorMessage.set(
            'Impossibile caricare il profilo del viso.'
          );

          this.loading.set(false);
        }
      });
  }

  protected selectEyeColor(
    value: EyeColor
  ): void {

    this.faceForm.controls
      .eyeColor
      .setValue(value);

    const reference =
      this.visual(
        EYE_COLOR_VISUALS,
        value
      );

    if (reference.color) {

      this.faceForm.controls
        .eyeReferenceColor
        .setValue(
          reference.color
        );
    }
  }

  protected label(
    value:
      string |
      null |
      undefined
  ): string {

    return getProfileEnumLabel(
      value
    );
  }

  protected visual(
    collection:
      Record<
        string,
        ProfileVisualReference
      >,
    value:
      string |
      null |
      undefined
  ): ProfileVisualReference {

    return getVisualReference(
      collection,
      value
    );
  }

  protected readonly faceShapeVisuals =
    FACE_SHAPE_VISUALS;

  protected readonly eyeShapeVisuals =
    EYE_SHAPE_VISUALS;

  protected readonly eyeOrientationVisuals =
    EYE_ORIENTATION_VISUALS;

  protected readonly eyeColorVisuals =
    EYE_COLOR_VISUALS;

  protected readonly eyebrowShapeVisuals =
    EYEBROW_SHAPE_VISUALS;

  protected readonly noseProfileVisuals =
    NOSE_PROFILE_VISUALS;

  protected readonly jawShapeVisuals =
    JAW_SHAPE_VISUALS;

  protected readonly chinShapeVisuals =
    CHIN_SHAPE_VISUALS;

  protected readonly lipShapeVisuals =
    LIP_SHAPE_VISUALS;

  protected submit(): void {

    if (
      this.faceForm.invalid ||
      !this.customerId
    ) {

      this.faceForm
        .markAllAsTouched();

      this.errorMessage.set(
        'Controlla i campi obbligatori.'
      );

      return;
    }

    this.loading.set(true);

    this.errorMessage.set('');

    const value =
      this.faceForm.getRawValue();

    const profile: FaceProfile = {

      customerId:
        this.customerId,

      ...value,

      eyeReferenceColor:
        value.eyeReferenceColor
          ?.toUpperCase() ??
        null
    };

    if (
      this.isEditMode() &&
      this.profileId
    ) {

      this.faceProfileService
        .update(
          this.profileId,
          profile
        )
        .subscribe({

          next: () =>
            this.navigateToCustomer(),

          error: error =>
            this.handleError(error)
        });

      return;
    }

    this.faceProfileService
      .insert(profile)
      .subscribe({

        next: () =>
          this.navigateToCustomer(),

        error: error =>
          this.handleError(error)
      });
  }

  private navigateToCustomer(): void {

    this.router.navigate([
      '/customers',
      this.customerId
    ]);
  }

  private getDefaultEyeColor(
    value:
      EyeColor |
      null |
      undefined
  ): string {

    if (!value) {

      return '#6A4634';
    }

    return (
      EYE_COLOR_VISUALS[value]
        ?.color ??
      '#6A4634'
    );
  }

  private handleError(
    error: HttpErrorResponse
  ): void {

    this.loading.set(false);

    if (
      error.error &&
      typeof error.error === 'object'
    ) {

      const message =
        Object.values(
          error.error
        ).find(
          value =>
            typeof value === 'string'
        );

      if (
        typeof message === 'string'
      ) {

        this.errorMessage.set(
          message
        );

        return;
      }
    }

    this.errorMessage.set(
      'Impossibile salvare il profilo del viso.'
    );
  }
}