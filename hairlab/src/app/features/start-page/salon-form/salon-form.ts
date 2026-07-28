import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentType } from '../../../models/enums/payment-type';
import { SalonService } from '../../../service/salon-service';
import { Salon } from '../../../models/salon';

@Component({
  selector: 'app-salon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salon-form.html',
  styleUrls: ['./salon-form.css']
})
export class SalonFormComponent implements OnInit {
  
  registerForm!: FormGroup;
  paymentTypes = Object.values(PaymentType);
  
  selectedPlan: string = '';
  selectedPrice: number = 0;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private salonService: SalonService
  ) {}

  ngOnInit(): void {
    // Recupera piano e prezzo passati dalla pagina precedente tramite queryParams
    this.route.queryParams.subscribe(params => {
      this.selectedPlan = params['plan'] || '1 MESE';
      this.selectedPrice = params['price'] ? Number(params['price']) : 49;
    });

    // Inizializzazione del form reattivo
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      paymentType: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    // Log di controllo per verificare se il form è valido al click
    console.log('Stato validità form:', this.registerForm.valid);
    console.log('Valori attuali form:', this.registerForm.value);

    if (this.registerForm.valid) {
      this.errorMessage = '';
      const formValues = this.registerForm.value;

      const newSalon: Salon = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        phoneNumber: formValues.phoneNumber,
        email: formValues.email,
        password: formValues.password,
        paymentType: formValues.paymentType,
        subscriptionPlan: this.selectedPlan,
        price: this.selectedPrice
      };

      console.log('Invio dati al server:', newSalon);

      this.salonService.registerSalon(newSalon).subscribe({
        next: (response) => {
          console.log('Salone registrato con successo:', response);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          console.error('Errore durante la registrazione:', err);
          this.errorMessage = err.error?.message || 'Errore imprevisto durante la registrazione.';
        }
      });
    } else {
      console.warn('Form non valido. Evidenzio i campi errati.');
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Compila tutti i campi obbligatori correttamente.';
    }
  }
}