import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerArea } from '../../models/customer-area';
import { JobTitle } from '../../models/enums/job-title';
import { Specialization } from '../../models/enums/specialization';
import { CustomerAreaService } from '../../service/customer-area-service';

@Component({
  selector: 'app-customer-services',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './customer-services.html',
  styleUrl: './customer-services.css',
})
export class CustomerServicesComponent implements OnInit {
  private readonly customerAreaService = inject(CustomerAreaService);

  protected readonly area = signal<CustomerArea | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly jobTitleLabels: Record<JobTitle, string> = {
    [JobTitle.SALON_MANAGER]: 'Responsabile salone',
    [JobTitle.RECEPTIONIST]: 'Receptionist',
    [JobTitle.HAIR_STYLIST]: 'Hair stylist',
    [JobTitle.COLORIST]: 'Colorista',
    [JobTitle.BARBER]: 'Barbiere',
    [JobTitle.ASSISTANT]: 'Assistente',
  };

  protected readonly specializationLabels: Record<Specialization, string> = {
    [Specialization.WOMENS_CUT]: 'Taglio donna',
    [Specialization.MENS_CUT]: 'Taglio uomo',
    [Specialization.PIXIE_CUT]: 'Pixie cut',
    [Specialization.BOB_CUT]: 'Bob cut',
    [Specialization.CURLY_HAIR_CUT]: 'Taglio riccio',
    [Specialization.BLOW_DRY]: 'Piega',
    [Specialization.STYLING]: 'Styling',
    [Specialization.UPDO]: 'Raccolti',
    [Specialization.HAIR_COLOR]: 'Colorazione',
    [Specialization.BALAYAGE]: 'Balayage',
    [Specialization.HIGHLIGHTS]: 'Highlights',
    [Specialization.COLOR_CORRECTION]: 'Correzione colore',
    [Specialization.CREATIVE_COLOR]: 'Colori creativi',
    [Specialization.BLEACHING]: 'Decolorazione',
    [Specialization.HAIR_TREATMENTS]: 'Trattamenti capelli',
    [Specialization.SCALP_TREATMENTS]: 'Trattamenti cute',
    [Specialization.BEARD_GROOMING]: 'Cura barba',
    [Specialization.SHAVING]: 'Rasatura',
  };

  ngOnInit(): void {
    this.loadCatalog();
  }

  protected loadCatalog(): void {
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
            : 'Impossibile caricare servizi e professionisti.',
        );
      },
    });
  }

  protected initials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
