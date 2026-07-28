import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './start-page.html',
  styleUrls: ['./start-page.css']
})
export class StartPageComponent {
  constructor(private router: Router) {}

  logoPath = '/LOGO/EUTE-LOGO-2024-COMPLETO.png';

  webApps = [
    { name: 'HairLab', description: 'Gestione avanzata per saloni di acconciatura, formule colore e magazzino.', active: true },
    { name: 'TechStore', description: 'Soluzione e-commerce per la vendita di prodotti tecnologici.', active: false },
    { name: 'HealthFlow', description: 'Software di gestione per studi medici e cliniche.', active: false },
    { name: 'LogiSmart', description: 'Piattaforma di tracciamento spedizioni e logistica.', active: false }
  ];

  navigateToHairLab() {
    this.router.navigate(['/salon/hairlab']);
  }
}