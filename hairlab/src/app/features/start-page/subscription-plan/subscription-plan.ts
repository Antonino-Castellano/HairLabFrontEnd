import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Plan {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
}

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plan.html',
  styleUrls: ['./subscription-plan.css']
})
export class SubscriptionPlanComponent {
  
  topPlans: Plan[] = [
    {
      title: '1 MESE',
      price: '€49 /mese',
      features: ['Accesso completo', 'Supporto base', 'Disdetta flessibile'],
      buttonText: 'REGISTRATI'
    },
    {
      title: '3 MESI',
      price: '€135',
      features: ['Accesso completo', 'Supporto prioritario', 'Risparmio sul mensile'],
      buttonText: 'REGISTRATI'
    },
    {
      title: '6 MESI',
      price: '€250',
      features: ['Accesso completo', 'Supporto dedicato', 'Vantaggi esclusivi'],
      buttonText: 'REGISTRATI'
    }
  ];

  bottomPlans: Plan[] = [
    {
      title: '1 ANNO',
      price: '€490 /anno',
      features: ['Accesso illimitato', 'Tutti i servizi inclusi', 'Massimo risparmio'],
      buttonText: 'REGISTRATI'
    },
    {
      title: 'UNA TANTUM',
      price: '€1.500',
      features: ['Licenza perpetua', 'Nessun rinnovo automatico', 'Accesso a vita ai contenuti'],
      buttonText: 'ACQUISTA'
    }
  ];

  constructor(private router: Router) {}

  onSelectPlan(plan: Plan) {
    const numericPrice = plan.price.replace(/[^0-9]/g, '');

    this.router.navigate(['/salon-form'], { 
      queryParams: { 
        plan: plan.title, 
        price: numericPrice 
      } 
    });
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}