import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultationService } from '../../../service/consultation-service';
import { CustomerService } from '../../../service/customer-service';
import { EmployeeService } from '../../../service/employee-service';
import { AppointmentService } from '../../../service/appointment-service';
import { Customer } from '../../../models/customer';
import { Employee } from '../../../models/employee';
import { Appointment } from '../../../models/appointment';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.css'
})
export class ConsultationFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly consultationService = inject(ConsultationService);
  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = signal<boolean>(false);
  consultationId = signal<number | null>(null);
  
  customers = signal<Customer[]>([]);
  employees = signal<Employee[]>([]);
  appointments = signal<Appointment[]>([]);

  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.consultationId.set(Number(idParam));
      this.loadConsultationData(Number(idParam));
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      employeeId: ['', Validators.required],
      appointmentId: [null],
      consultationDate: ['', Validators.required],
      type: ['', Validators.required],
      objective: ['', Validators.required],
      initialDiagnosis: ['', Validators.required],
      currentCondition: ['', Validators.required],
      feasibility: [''],
      risks: [''],
      proposedProcedure: ['', Validators.required],
      technicalNotes: ['', Validators.required]
    });
  }

  loadDropdownData(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers.set(data.filter(c => c.active)),
      error: (err) => console.error('Errore caricamento clienti:', err)
    });

    this.employeeService.getAll().subscribe({
      next: (data) => this.employees.set(data.filter(e => e.active)),
      error: (err) => console.error('Errore caricamento dipendenti:', err)
    });

    this.appointmentService.getAll().subscribe({
      next: (data) => this.appointments.set(data),
      error: (err) => console.error('Errore caricamento appuntamenti:', err)
    });
  }

  loadConsultationData(id: number): void {
    this.loading.set(true);
    this.consultationService.getById(id).subscribe({
      next: (consultation) => {
        // Formatta la data per l'input datetime-local (YYYY-MM-DDTHH:mm)
        let formattedDate = '';
        if (consultation.consultationDate) {
          formattedDate = consultation.consultationDate.substring(0, 16);
        }

        this.form.patchValue({
          customerId: consultation.customerId,
          employeeId: consultation.employeeId,
          appointmentId: consultation.appointmentId || null,
          consultationDate: formattedDate,
          type: consultation.type,
          objective: consultation.objective,
          initialDiagnosis: consultation.initialDiagnosis,
          currentCondition: consultation.currentCondition,
          feasibility: consultation.feasibility || '',
          risks: consultation.risks || '',
          proposedProcedure: consultation.proposedProcedure,
          technicalNotes: consultation.technicalNotes
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento consulenza:', err);
        this.errorMessage.set('Impossibile caricare i dati della consulenza.');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const formValue = { ...this.form.value };
    // Se appointmentId è vuoto o stringa vuota, impostalo a null
    if (!formValue.appointmentId) {
      formValue.appointmentId = null;
    }

    const request$ = this.isEditMode() && this.consultationId()
      ? this.consultationService.update(this.consultationId()!, formValue)
      : this.consultationService.insert(formValue);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/consultations']);
      },
      error: (err) => {
        console.error('Errore salvataggio consulenza:', err);
        this.errorMessage.set(err.error?.message || 'Si è verificato un errore durante il salvataggio.');
        this.submitting.set(false);
      }
    });
  }
}