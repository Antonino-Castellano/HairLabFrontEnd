import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentType } from '../../../models/enums/payment-type';
import { UserService } from '../../../service/user-service';
import { User } from '../../../models/user';
import { Role } from '../../../models/enums/role';

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

  PaymentTypeEnum = PaymentType;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedPlan = params['plan'] || '1 MESE';
      this.selectedPrice = params['price'] ? Number(params['price']) : 49;
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      paymentType: ['', [Validators.required]],
      cardNumber: [''],
      cardHolder: [''],
      cardExpDate: [''],
      cardCvv: [''],
      paypalEmail: ['']
    });

    this.registerForm.get('paymentType')?.valueChanges.subscribe(value => {
      this.updatePaymentValidations(value);
    });
  }

  updatePaymentValidations(paymentType: PaymentType): void {
    const cardNumber = this.registerForm.get('cardNumber');
    const cardHolder = this.registerForm.get('cardHolder');
    const cardExpDate = this.registerForm.get('cardExpDate');
    const cardCvv = this.registerForm.get('cardCvv');
    const paypalEmail = this.registerForm.get('paypalEmail');

    if (paymentType === PaymentType.CREDIT_CARD) {
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      cardHolder?.setValidators([Validators.required]);
      cardExpDate?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]);
      cardCvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      
      paypalEmail?.clearValidators();
      paypalEmail?.setValue('');
    } else if (paymentType === PaymentType.PAYPAL) {
      paypalEmail?.setValidators([Validators.required, Validators.email]);

      cardNumber?.clearValidators();
      cardHolder?.clearValidators();
      cardExpDate?.clearValidators();
      cardCvv?.clearValidators();

      cardNumber?.setValue('');
      cardHolder?.setValue('');
      cardExpDate?.setValue('');
      cardCvv?.setValue('');
    }

    cardNumber?.updateValueAndValidity();
    cardHolder?.updateValueAndValidity();
    cardExpDate?.updateValueAndValidity();
    cardCvv?.updateValueAndValidity();
    paypalEmail?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage = '';
      const formValues = this.registerForm.value;

      const newUser: User = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        dob: formValues.dob,
        address: 'Account SuperAdmin HairLab',
        phoneNumber: formValues.phoneNumber,
        email: formValues.email,
        password: formValues.password,
        paymentType: formValues.paymentType,
        subscriptionPlan: this.selectedPlan,
        price: this.selectedPrice,
        role: Role.SUPERADMIN,

        cardNumber: formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardNumber : undefined,
        cardHolder: formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardHolder : undefined,
        cardExpDate: formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardExpDate : undefined,
        cardCvv: formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardCvv : undefined,
        paypalEmail: formValues.paymentType === PaymentType.PAYPAL ? formValues.paypalEmail : undefined
      };

      this.userService.insertUser(newUser).subscribe({
        next: (response) => {
          console.log('Titolare/Salone registrato con successo come SuperAdmin:', response);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          console.error('Errore durante la registrazione:', err);
          this.errorMessage = err.error?.message || 'Errore imprevisto durante la registrazione.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Compila correttamente tutti i campi obbligatori, inclusi quelli di pagamento.';
    }
  }
}