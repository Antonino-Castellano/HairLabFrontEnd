import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface EuteApplication {
  name: string;
  category: string;
  description: string;
  screenshot: string;
  active: boolean;
  status: string;
  highlights: string[];
}

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-page.html',
  styleUrls: ['./start-page.css'],
})
export class StartPageComponent {
  readonly webApps: EuteApplication[] = [
    {
      name: 'HairLab',
      category: 'Beauty & Salon Management',
      description:
        'L’ecosistema professionale che collega clienti, consulenze, agenda, Color Lab, magazzino e statistiche.',
      screenshot: '/assets/SCREENSHOTPROGRAMMI/SCREEN-HAIRLAB.png',
      active: true,
      status: 'Disponibile',
      highlights: ['Consulenza evoluta', 'Color Lab', 'Gestione completa'],
    },
    {
      name: 'TechStore',
      category: 'Commerce & Retail',
      description:
        'Una piattaforma pensata per coordinare vendite, catalogo, clienti, fornitori e performance commerciali.',
      screenshot: '/assets/SCREENSHOTPROGRAMMI/SCREEN-TECHSTORE.png',
      active: false,
      status: 'In sviluppo',
      highlights: ['Catalogo', 'Vendite', 'Analytics'],
    },
    {
      name: 'HealthFlow',
      category: 'Healthcare Operations',
      description:
        'Agenda, pazienti, cartelle e flussi amministrativi riuniti in un ambiente semplice e organizzato.',
      screenshot: '/assets/SCREENSHOTPROGRAMMI/SCREEN-HEALTHFLOW.png',
      active: false,
      status: 'In sviluppo',
      highlights: ['Agenda', 'Pazienti', 'Documenti'],
    },
    {
      name: 'LogiSmart',
      category: 'Logistics & Tracking',
      description:
        'Controllo di spedizioni, magazzino, documenti e tracciamento operativo da un’unica dashboard.',
      screenshot: '/assets/SCREENSHOTPROGRAMMI/SCREEN-LOGISMART.png',
      active: false,
      status: 'In sviluppo',
      highlights: ['Tracking', 'Magazzino', 'Spedizioni'],
    },
  ];

  constructor(private readonly router: Router) {}

  openApplication(application: EuteApplication): void {
    if (application.active) {
      void this.router.navigate(['/salon/hairlab']);
    }
  }

  openHairLab(): void {
    void this.router.navigate(['/salon/hairlab']);
  }

  openLogin(): void {
    void this.router.navigate(['/login']);
  }

  scrollToApplications(): void {
    document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
