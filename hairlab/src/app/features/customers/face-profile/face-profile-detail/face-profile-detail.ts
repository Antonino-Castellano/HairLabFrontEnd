import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  FaceProfile
} from '../../../../models/face-profile';

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
  FaceProfileService
} from '../../../../service/face-profile-service';

import {
  ProfileVisualIconComponent
} from '../../../../shared/profile-visual/profile-visual-icon';

/**
 * Visualizza il profilo morfologico
 * del viso della cliente.
 *
 * Utilizza lo stesso sistema
 * di icone SVG lineari del form.
 */
@Component({
  selector: 'app-face-profile-detail',
  standalone: true,
  imports: [
    RouterLink,
    ProfileVisualIconComponent
  ],
  templateUrl: './face-profile-detail.html',
  styleUrl: './face-profile-detail.css'
})
export class FaceProfileDetailComponent
    implements OnChanges {

  private readonly faceProfileService =
    inject(FaceProfileService);

  @Input({
    required: true
  })
  customerId!: number;

  protected readonly faceProfile =
    signal<FaceProfile | null>(
      null
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly profileNotFound =
    signal(false);

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

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId > 0
    ) {

      this.loadFaceProfile();
    }
  }

  protected loadFaceProfile(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.profileNotFound.set(false);

    this.faceProfileService
      .getByCustomerId(
        this.customerId
      )
      .subscribe({

        next: profile => {

          this.faceProfile.set(
            profile
          );

          this.loading.set(false);
        },

        error: error => {

          this.loading.set(false);

          this.faceProfile.set(
            null
          );

          if (
            error.status === 400 ||
            error.status === 404
          ) {

            this.profileNotFound.set(
              true
            );

            return;
          }

          this.errorMessage.set(
            'Impossibile caricare il profilo del viso.'
          );
        }
      });
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

  protected getEyeReferenceColor(
    profile: FaceProfile
  ): string {

    if (
      profile.eyeReferenceColor
    ) {

      return profile.eyeReferenceColor;
    }

    if (
      profile.eyeColor
    ) {

      return (
        this.visual(
          this.eyeColorVisuals,
          profile.eyeColor
        ).color ??
        '#B8AAA2'
      );
    }

    return '#B8AAA2';
  }
}