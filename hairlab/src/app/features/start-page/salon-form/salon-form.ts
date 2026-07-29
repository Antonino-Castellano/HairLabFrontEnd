import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentType } from '../../../models/enums/payment-type';
import { Role } from '../../../models/enums/role';
import { User } from '../../../models/user';
import { UserService } from '../../../service/user-service';

@Component({
  selector: 'app-salon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salon-form.html',
  styleUrls: ['./salon-form.css'],
})
export class SalonFormComponent implements OnInit {
  registerForm!: FormGroup;
  readonly paymentTypes = Object.values(PaymentType);
  readonly PaymentTypeEnum = PaymentType;

  selectedPlan = '';
  selectedPrice = 0;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
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
      paypalEmail: [''],
    });

    this.registerForm.get('paymentType')?.valueChanges.subscribe((value) => {
      this.updatePaymentValidations(value);
    });
  }

  get selectedPlanLabel(): string {
    return this.selectedPlan === 'UNA TANTUM'
      ? 'Licenza permanente'
      : this.selectedPlan.toLowerCase();
  }

  get monthlyEquivalent(): number | null {
    const monthsByPlan: Record<string, number> = {
      '1 MESE': 1,
      '3 MESI': 3,
      '6 MESI': 6,
      '1 ANNO': 12,
    };

    const months = monthsByPlan[this.selectedPlan];
    return months ? Math.round((this.selectedPrice / months) * 100) / 100 : null;
  }

  paymentLabel(type: PaymentType): string {
    return type === PaymentType.CREDIT_CARD ? 'Carta di credito' : 'PayPal';
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
      cardExpDate?.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/),
      ]);
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

  goBackToPlans(): void {
    void this.router.navigate(['/salon/hairlab']);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Controlla i campi evidenziati e completa i dati di pagamento richiesti.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const formValues = this.registerForm.value;

    const newUser: User = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      dob: formValues.dob,
      address: 'Account titolare HairLab',
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      password: formValues.password,
      paymentType: formValues.paymentType,
      subscriptionPlan: this.selectedPlan,
      price: this.selectedPrice,
      role: Role.SUPERADMIN,
      cardNumber:
        formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardNumber : undefined,
      cardHolder:
        formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardHolder : undefined,
      cardExpDate:
        formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardExpDate : undefined,
      cardCvv: formValues.paymentType === PaymentType.CREDIT_CARD ? formValues.cardCvv : undefined,
      paypalEmail:
        formValues.paymentType === PaymentType.PAYPAL ? formValues.paypalEmail : undefined,
    };

    this.userService.insertUser(newUser).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.message || 'Non è stato possibile completare la registrazione.';
      },
    });
  }
}
