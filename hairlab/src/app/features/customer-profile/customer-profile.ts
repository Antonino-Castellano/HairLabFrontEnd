import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ColorPalette } from '../../models/color-analysis';
import { CustomerArea } from '../../models/customer-area';
import { AppointmentStatus } from '../../models/enums/appointment-status';
import { ConsultationType } from '../../models/enums/consultation-type';
import { hairLabTechnicalLabel } from '../../shared/ui/hairlab-technical-labels';
import { CustomerAreaService } from '../../service/customer-area-service';
import {
  HAIR_CONDITION_LABELS,
  HAIR_LENGTH_LABELS,
  HAIR_TEXTURE_LABELS,
  HAIR_TYPE_LABELS,
  PHYSICAL_VALUE_LABELS,
  REFLECTION_LABELS,
  TONE_LEVEL_LABELS,
} from '../customers/hair-profile/hair-profile-display';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.css',
})
export class CustomerProfileComponent implements OnInit {
  private readonly customerAreaService = inject(CustomerAreaService);

  protected readonly area = signal<CustomerArea | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly activeSection = signal<'hair' | 'face' | 'beard' | 'color' | 'history'>(
    'hair',
  );

  protected readonly toneLabels = TONE_LEVEL_LABELS;
  protected readonly reflectionLabels = REFLECTION_LABELS;
  protected readonly hairTypeLabels = HAIR_TYPE_LABELS;
  protected readonly hairTextureLabels = HAIR_TEXTURE_LABELS;
  protected readonly physicalValueLabels = PHYSICAL_VALUE_LABELS;
  protected readonly hairConditionLabels = HAIR_CONDITION_LABELS;
  protected readonly hairLengthLabels = HAIR_LENGTH_LABELS;

  protected readonly consultationTypeLabels: Record<ConsultationType, string> = {
    [ConsultationType.HAIR_CUT]: 'Taglio',
    [ConsultationType.HAIR_COLOR]: 'Colore',
    [ConsultationType.HAIR_STYLING]: 'Styling',
    [ConsultationType.SCALP_TREATMENT]: 'Trattamento cute',
    [ConsultationType.HAIR_RESTORATION]: 'Ricostruzione',
    [ConsultationType.HAIR_EXTENSION]: 'Extension',
    [ConsultationType.HAIR_STRAIGHTENING]: 'Stiratura',
    [ConsultationType.HAIR_PERMING]: 'Permanente',
    [ConsultationType.HAIR_REPAIR]: 'Riparazione',
    [ConsultationType.HAIR_ANALYSIS]: 'Analisi capelli',
  };

  protected readonly completedAppointments = computed(() =>
    (this.area()?.appointmentDetails ?? []).filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED,
    ),
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerAreaService.getMyArea().subscribe({
      next: (area) => {
        this.area.set(area);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'Impossibile caricare il tuo profilo HairLab.',
        );
      },
    });
  }

  protected selectSection(section: 'hair' | 'face' | 'beard' | 'color' | 'history'): void {
    this.activeSection.set(section);
  }

  protected profileLabel(value: string | null | undefined): string {
    return hairLabTechnicalLabel(value);
  }

  protected paletteEntries(palette: ColorPalette | null | undefined): [string, string][] {
    return palette ? Object.entries(palette) : [];
  }
}
