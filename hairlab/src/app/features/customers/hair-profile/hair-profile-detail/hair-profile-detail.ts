import {
  Component,
  inject,
  Input,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HairProfile } from '../../../../models/hair-profile';
import { HairProfileService } from '../../../../service/hair-profile-service';
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
  selector: 'app-hair-profile-detail',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './hair-profile-detail.html',
  styleUrl: './hair-profile-detail.css'
})
export class HairProfileDetailComponent implements OnChanges {
  /**
   * ID del cliente ricevuto dal componente padre
   * CustomerDetailComponent.
   */
  @Input({ required: true })
  customerId!: number;

  /**
   * Service che comunica con il backend.
   */
  private readonly hairProfileService =
    inject(HairProfileService);

  /**
   * Profilo capelli del cliente.
   *
   * null significa che il cliente
   * non possiede ancora un HairProfile.
   */
  protected readonly hairProfile =
    signal<HairProfile | null>(null);

  /**
   * Stato di caricamento della sezione.
   */
  protected readonly loading =
    signal(false);

  /**
   * Eventuale messaggio di errore.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Mappe utilizzate dal template
   * per mostrare testi italiani e colori.
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
   * Angular richiama questo metodo
   * quando cambia un valore ricevuto tramite @Input.
   *
   * Quando riceviamo customerId,
   * carichiamo il relativo HairProfile.
   */
  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (
      changes['customerId'] &&
      this.customerId > 0
    ) {
      this.loadHairProfile();
    }
  }

  /**
   * Recupera dal backend il profilo
   * associato al cliente.
   */
  protected loadHairProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.hairProfileService
      .getByCustomerId(this.customerId)
      .subscribe({
        next: profile => {
          this.hairProfile.set(profile);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'Impossibile caricare il profilo capelli.'
          );

          this.loading.set(false);
        }
      });
  }

  /**
   * Elimina il profilo capelli.
   */
  protected deleteHairProfile(): void {
    const profile =
      this.hairProfile();

    if (!profile?.id) {
      return;
    }

    const confirmed =
      confirm(
        'Vuoi eliminare il profilo capelli di questo cliente?'
      );

    if (!confirmed) {
      return;
    }

    this.hairProfileService
      .delete(profile.id)
      .subscribe({
        next: () => {
          /**
           * Dopo la cancellazione impostiamo null.
           *
           * Il template mostrerà automaticamente
           * il pulsante per creare un nuovo profilo.
           */
          this.hairProfile.set(null);
        },
        error: () => {
          this.errorMessage.set(
            'Impossibile eliminare il profilo capelli.'
          );
        }
      });
  }
}