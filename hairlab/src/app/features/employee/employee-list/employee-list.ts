import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../service/employee-service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);

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
      return list.filter(e => e.active);
    }
    if (filter === 'INACTIVE') {
      return list.filter(e => !e.active);
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
      }
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

  protected toggleStatus(employee: Employee): void {
    if (!employee.id) return;

    const action = employee.active ? 'disattivare' : 'attivare';
    const confirmed = confirm(`Vuoi ${action} il dipendente ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    const request$ = employee.active 
      ? this.employeeService.deactivate(employee.id) 
      : this.employeeService.activate(employee.id);

    request$.subscribe({
      next: () => this.loadEmployees(),
      error: () => this.errorMessage.set(`Impossibile ${action} il dipendente.`)
    });
  }

  protected deleteEmployee(employee: Employee): void {
    if (!employee.id) return;

    const confirmed = confirm(`Vuoi eliminare ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    this.employeeService.delete(employee.id).subscribe({
      next: () => this.loadEmployees(),
      error: () => this.errorMessage.set('Impossibile eliminare il dipendente.')
    });
  }
}