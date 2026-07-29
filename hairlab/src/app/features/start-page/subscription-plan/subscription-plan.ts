import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Plan {
  title: string;
  price: string;
  numericPrice: number;
  subtitle: string;
  billingNote: string;
  features: string[];
  buttonText: string;
  recommended?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plan.html',
  styleUrls: ['./subscription-plan.css'],
})
export class SubscriptionPlanComponent {
  readonly plans: Plan[] = [
    {
      title: '1 MESE',
      price: '€49',
      numericPrice: 49,
      subtitle: 'al mese',
      billingNote: 'Ideale per iniziare senza vincoli.',
      features: ['Accesso completo a HairLab', 'Aggiornamenti inclusi', 'Supporto standard'],
      buttonText: 'Scegli 1 mese',
    },
    {
      title: '3 MESI',
      price: '€135',
      numericPrice: 135,
      subtitle: '€45 al mese',
      billingNote: 'Risparmi €12 rispetto al piano mensile.',
      features: ['Tutte le funzionalità HairLab', 'Supporto prioritario', 'Backup e aggiornamenti'],
      buttonText: 'Scegli 3 mesi',
      recommended: true,
      badge: 'Più scelto',
    },
    {
      title: '6 MESI',
      price: '€250',
      numericPrice: 250,
      subtitle: 'circa €42 al mese',
      billingNote: 'Pensato per consolidare il lavoro del salone.',
      features: ['Accesso completo', 'Supporto dedicato', 'Configurazione assistita'],
      buttonText: 'Scegli 6 mesi',
    },
    {
      title: '1 ANNO',
      price: '€490',
      numericPrice: 490,
      subtitle: 'circa €41 al mese',
      billingNote: 'Il miglior equilibrio tra continuità e risparmio.',
      features: ['Accesso annuale completo', 'Supporto dedicato', 'Priorità sugli aggiornamenti'],
      buttonText: 'Scegli 1 anno',
    },
    {
      title: 'UNA TANTUM',
      price: '€1.500',
      numericPrice: 1500,
      subtitle: 'licenza permanente',
      billingNote: 'Nessun rinnovo periodico.',
      features: [
        'Licenza perpetua',
        'Installazione assistita',
        'Aggiornamenti della versione inclusi',
      ],
      buttonText: 'Acquista licenza',
    },
  ];

  constructor(private readonly router: Router) {}

  onSelectPlan(plan: Plan): void {
    void this.router.navigate(['/salon-form'], {
      queryParams: {
        plan: plan.title,
        price: plan.numericPrice,
      },
    });
  }

  onLogin(): void {
    void this.router.navigate(['/login']);
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }
}
