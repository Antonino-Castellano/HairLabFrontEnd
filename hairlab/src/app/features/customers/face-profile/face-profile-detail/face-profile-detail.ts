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
  FaceProfileService
} from '../../../../service/face-profile-service';

/**
 * Mostra il profilo morfologico
 * del viso di una cliente.
 *
 * Il componente riceve customerId
 * dal componente padre CustomerDetail.
 */
@Component({
  selector: 'app-face-profile-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './face-profile-detail.html',
  styleUrl: './face-profile-detail.css'
})
export class FaceProfileDetailComponent
    implements OnChanges {

  /**
   * Service utilizzato per comunicare
   * con il backend.
   */
  private readonly faceProfileService =
    inject(FaceProfileService);

  /**
   * ID della cliente.
   *
   * Verrà passato dal CustomerDetail:
   *
   * <app-face-profile-detail
   *   [customerId]="customer.id">
   * </app-face-profile-detail>
   */
  @Input({
    required: true
  })
  customerId!: number;

  /**
   * Profilo ricevuto dal backend.
   */
  protected readonly faceProfile =
    signal<FaceProfile | null>(null);

  /**
   * Stato di caricamento.
   */
  protected readonly loading =
    signal(false);

  /**
   * Errore generico.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Indica che il cliente non possiede
   * ancora un FaceProfile.
   */
  protected readonly profileNotFound =
    signal(false);

  /**
   * Quando cambia customerId
   * ricarichiamo il profilo.
   */
  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId
    ) {

      this.loadFaceProfile();
    }
  }

  /**
   * Recupera il profilo del viso
   * tramite customerId.
   */
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

          /**
           * Il backend attuale può restituire
           * 400 quando il profilo non esiste.
           *
           * Consideriamo 400 e 404 come:
           *
           * "profilo non ancora presente".
           */
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

  /**
   * Traduce un valore Enum tecnico
   * nella relativa etichetta italiana.
   */
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
}