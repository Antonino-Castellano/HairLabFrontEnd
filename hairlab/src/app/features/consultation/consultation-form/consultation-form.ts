import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Appointment } from '../../../models/appointment';
import {
  ConsultationRecommendation,
  RecommendationDecisionStatus,
} from '../../../models/consultation-recommendation';
import { Customer } from '../../../models/customer';
import { Employee } from '../../../models/employee';
import { AppointmentService } from '../../../service/appointment-service';
import { ConsultationService } from '../../../service/consultation-service';
import { CustomerService } from '../../../service/customer-service';
import { EmployeeService } from '../../../service/employee-service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog.service';
import { HairLabTechnicalLabelPipe } from '../../../shared/ui/hairlab-technical-label.pipe';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HairLabTechnicalLabelPipe],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.css',
})
export class ConsultationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly consultationService = inject(ConsultationService);
  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = signal<boolean>(false);
  consultationId = signal<number | null>(null);

  customers = signal<Customer[]>([]);
  employees = signal<Employee[]>([]);
  appointments = signal<Appointment[]>([]);
  savedRecommendations = signal<ConsultationRecommendation[]>([]);

  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  updatingRecommendationId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.consultationId.set(Number(idParam));
      this.loadConsultationData(Number(idParam));
      return;
    }

    const customerId = Number(this.route.snapshot.queryParamMap.get('customerId'));
    if (Number.isFinite(customerId) && customerId > 0) {
      this.form.patchValue({ customerId });
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
      technicalNotes: ['', Validators.required],
    });
  }

  loadDropdownData(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers.set(data.filter((customer) => customer.active)),
      error: (error) => console.error('Errore caricamento clienti:', error),
    });

    this.employeeService.getAll().subscribe({
      next: (data) => this.employees.set(data.filter((employee) => employee.active)),
      error: (error) => console.error('Errore caricamento dipendenti:', error),
    });

    this.appointmentService.getAll().subscribe({
      next: (data) => this.appointments.set(data),
      error: (error) => console.error('Errore caricamento appuntamenti:', error),
    });
  }

  loadConsultationData(id: number): void {
    this.loading.set(true);
    this.consultationService.getById(id).subscribe({
      next: (consultation) => {
        const formattedDate = consultation.consultationDate?.substring(0, 16) ?? '';
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
          technicalNotes: consultation.technicalNotes,
        });
        this.savedRecommendations.set(consultation.recommendations ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Errore caricamento consulenza:', error);
        this.errorMessage.set('Impossibile caricare i dati della consulenza.');
        this.loading.set(false);
      },
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
    if (!formValue.appointmentId) {
      formValue.appointmentId = null;
    }

    const request$ =
      this.isEditMode() && this.consultationId()
        ? this.consultationService.update(this.consultationId()!, formValue)
        : this.consultationService.insert(formValue);

    request$.subscribe({
      next: () => this.router.navigate(['/consultations']),
      error: (error) => {
        console.error('Errore salvataggio consulenza:', error);
        this.errorMessage.set(
          error.error?.message || 'Si è verificato un errore durante il salvataggio.',
        );
        this.submitting.set(false);
      },
    });
  }

  updateRecommendationDecision(
    recommendation: ConsultationRecommendation,
    decisionStatus: RecommendationDecisionStatus,
    decisionNotes?: string,
  ): void {
    const consultationId = this.consultationId();
    if (!consultationId) return;

    this.updatingRecommendationId.set(recommendation.id);
    this.consultationService
      .updateRecommendationDecision(consultationId, recommendation.id, {
        decisionStatus,
        decisionNotes: decisionNotes?.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.savedRecommendations.update((values) =>
            values.map((value) => (value.id === updated.id ? updated : value)),
          );
          this.updatingRecommendationId.set(null);
          this.toastService.success('Decisione aggiornata', this.statusLabel(decisionStatus));
        },
        error: (error) => {
          this.updatingRecommendationId.set(null);
          this.toastService.error(
            'Aggiornamento non riuscito',
            error?.error?.message ?? 'Impossibile aggiornare la proposta.',
          );
        },
      });
  }

  async deleteRecommendation(recommendation: ConsultationRecommendation): Promise<void> {
    const consultationId = this.consultationId();
    if (!consultationId) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Rimuovere il suggerimento?',
      message:
        'Verrà eliminato soltanto il collegamento storico con questa consulenza. Il catalogo e il motore non saranno modificati.',
      confirmLabel: 'Rimuovi',
      severity: 'warning',
    });
    if (!confirmed) return;

    this.consultationService.deleteRecommendation(consultationId, recommendation.id).subscribe({
      next: () => {
        this.savedRecommendations.update((values) =>
          values.filter((value) => value.id !== recommendation.id),
        );
        this.toastService.success('Suggerimento rimosso dalla consulenza');
      },
      error: (error) =>
        this.toastService.error(
          'Rimozione non riuscita',
          error?.error?.message ?? 'Impossibile rimuovere il suggerimento.',
        ),
    });
  }

  statusLabel(status: RecommendationDecisionStatus): string {
    const labels: Record<RecommendationDecisionStatus, string> = {
      PROPOSED: 'In valutazione',
      ACCEPTED: 'Accettata',
      REJECTED: 'Rifiutata',
      MODIFIED: 'Accettata con modifiche',
    };
    return labels[status];
  }

  statusClass(status: RecommendationDecisionStatus): string {
    return status.toLowerCase();
  }
}
