import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../service/employee-service';
import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  // Filtro selezionato ('ALL' | 'ACTIVE' | 'INACTIVE')
  protected readonly selectedFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Lista filtrata computata in automatico
  protected readonly filteredEmployees = computed(() => {
    const list = this.employees();
    const filter = this.selectedFilter();

    if (filter === 'ACTIVE') {
      return list.filter((e) => e.active);
    }
    if (filter === 'INACTIVE') {
      return list.filter((e) => !e.active);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  protected loadEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.employeeService.getAll().subscribe({
      next: (employees: Employee[]) => {
        this.employees.set(employees ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 401) {
          this.errorMessage.set('Sessione scaduta o autenticazione non valida.');
        } else if (error.status === 403) {
          this.errorMessage.set('Non hai i permessi per visualizzare i dipendenti.');
        } else if (error.status === 404) {
          this.errorMessage.set('Endpoint dipendenti non trovato.');
        } else if (error.status === 0) {
          this.errorMessage.set('Impossibile comunicare con il backend.');
        } else {
          this.errorMessage.set('Impossibile caricare i dipendenti.');
        }
      },
    });
  }

  protected getEmployeeInitials(employee: Employee): string {
    const firstNameInitial = employee.firstName ? employee.firstName.charAt(0).toUpperCase() : '';
    const lastNameInitial = employee.lastName ? employee.lastName.charAt(0).toUpperCase() : '';
    return `${firstNameInitial}${lastNameInitial}` || '?';
  }

  protected onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'ALL' | 'ACTIVE' | 'INACTIVE';
    this.selectedFilter.set(value);
  }

  protected async toggleStatus(employee: Employee): Promise<void> {
    if (!employee.id) return;

    const action = employee.active ? 'disattivare' : 'attivare';
    const confirmed = await this.confirmDialog.confirm({
      title: employee.active ? 'Disattivare il dipendente?' : 'Riattivare il dipendente?',
      message: `${employee.firstName} ${employee.lastName}`,
      confirmLabel: employee.active ? 'Disattiva' : 'Riattiva',
      severity: employee.active ? 'warning' : 'default',
    });
    if (!confirmed) return;

    const request$ = employee.active
      ? this.employeeService.deactivate(employee.id)
      : this.employeeService.activate(employee.id);

    request$.subscribe({
      next: () => {
        this.toastService.success(
          employee.active ? 'Dipendente disattivato' : 'Dipendente riattivato',
        );
        this.loadEmployees();
      },
      error: () => {
        this.errorMessage.set(`Impossibile ${action} il dipendente.`);
        this.toastService.error('Operazione non riuscita');
      },
    });
  }

  protected async deleteEmployee(employee: Employee): Promise<void> {
    if (!employee.id) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminare il dipendente?',
      message: `${employee.firstName} ${employee.lastName}. Lo storico potrebbe impedire l’eliminazione definitiva.`,
      confirmLabel: 'Elimina',
      severity: 'danger',
    });
    if (!confirmed) return;

    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.toastService.success('Dipendente eliminato');
        this.loadEmployees();
      },
      error: () => {
        this.errorMessage.set('Impossibile eliminare il dipendente.');
        this.toastService.error('Eliminazione non riuscita');
      },
    });
  }
}
