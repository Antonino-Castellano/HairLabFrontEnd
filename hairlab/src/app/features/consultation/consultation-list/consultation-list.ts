import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../service/consultation-service';
import { CustomerService } from '../../../service/customer-service';
import { EmployeeService } from '../../../service/employee-service';
import { Customer } from '../../../models/customer';
import { Employee } from '../../../models/employee';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { HairLabTechnicalLabelPipe } from '../../../shared/ui/hairlab-technical-label.pipe';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HairLabTechnicalLabelPipe],
  templateUrl: './consultation-list.html',
  styleUrl: './consultation-list.css',
})
export class ConsultationListComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly consultationService = inject(ConsultationService);
  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  consultations = signal<Consultation[]>([]);
  customers = signal<Customer[]>([]);
  employees = signal<Employee[]>([]);

  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Filtri
  selectedCustomerId = signal<string>('ALL');
  selectedType = signal<string>('ALL');

  filteredConsultations = computed(() => {
    return this.consultations().filter((consultation) => {
      const matchesCustomer =
        this.selectedCustomerId() === 'ALL' ||
        consultation.customerId === Number(this.selectedCustomerId());

      const matchesType =
        this.selectedType() === 'ALL' || consultation.type === this.selectedType();

      return matchesCustomer && matchesType;
    });
  });

  ngOnInit(): void {
    const customerId = Number(this.activatedRoute.snapshot.queryParamMap.get('customerId'));

    if (Number.isInteger(customerId) && customerId > 0) {
      this.selectedCustomerId.set(String(customerId));
    }

    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Carica clienti e dipendenti per mostrare i nomi nelle tabelle
    this.customerService.getAll().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => console.error('Errore caricamento clienti:', err),
    });

    this.employeeService.getAll().subscribe({
      next: (data) => this.employees.set(data),
      error: (err) => console.error('Errore caricamento dipendenti:', err),
    });

    // Carica le consulenze
    this.consultationService.getAll().subscribe({
      next: (data) => {
        this.consultations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il caricamento delle consulenze:', err);
        this.errorMessage.set('Impossibile caricare lo storico delle consulenze.');
        this.loading.set(false);
      },
    });
  }

  onCustomerFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCustomerId.set(select.value);
  }

  onTypeFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedType.set(select.value);
  }

  getCustomerName(customerId: number): string {
    const cust = this.customers().find((c) => c.id === customerId);
    return cust ? `${cust.firstName} ${cust.lastName}` : 'N/D';
  }

  getEmployeeName(employeeId: number): string {
    const emp = this.employees().find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'N/D';
  }

  async deleteConsultation(consultation: Consultation): Promise<void> {
    if (!consultation.id) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminare la consulenza?',
      message: 'L’operazione è definitiva e non può essere annullata.',
      confirmLabel: 'Elimina',
      severity: 'danger',
    });

    if (!confirmed) return;

    this.consultationService.delete(consultation.id).subscribe({
      next: () => {
        this.toastService.success('Consulenza eliminata');
        this.loadData();
      },
      error: (err) => {
        console.error('Errore durante l’eliminazione:', err);
        this.toastService.error('Impossibile eliminare la consulenza');
      },
    });
  }
}
