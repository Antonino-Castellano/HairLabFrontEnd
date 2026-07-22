import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
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

  /**
   * Quando il componente viene inizializzato
   * recupera automaticamente i dipendenti dal backend.
   */
  ngOnInit(): void {
    this.loadEmployees();
  }

  /**
   * Recupera tutti i dipendenti tramite EmployeeService.
   */
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
          this.errorMessage.set(
            'Sessione scaduta o autenticazione non valida.'
          );
        } else if (error.status === 403) {
          this.errorMessage.set(
            'Non hai i permessi per visualizzare i dipendenti.'
          );
        } else if (error.status === 404) {
          this.errorMessage.set(
            'Endpoint dipendenti non trovato.'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'Impossibile comunicare con il backend.'
          );
        } else {
          this.errorMessage.set(
            'Impossibile caricare i dipendenti.'
          );
        }
      }
    });
  }

  /**
   * Crea le iniziali utilizzate nell'avatar del dipendente.
   */
  protected getEmployeeInitials(employee: Employee): string {
    const firstNameInitial = employee.firstName
      ? employee.firstName.charAt(0).toUpperCase()
      : '';

    const lastNameInitial = employee.lastName
      ? employee.lastName.charAt(0).toUpperCase()
      : '';

    return `${firstNameInitial}${lastNameInitial}` || '?';
  }

  /**
   * Elimina il dipendente selezionato dopo una conferma.
   * Dopo l'eliminazione ricarica la lista aggiornata.
   */
  protected deleteEmployee(employee: Employee): void {
    if (!employee.id) {
      return;
    }

    const confirmed = confirm(
      `Vuoi eliminare ${employee.firstName} ${employee.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.loadEmployees();
      },
      error: () => {
        this.errorMessage.set(
          'Impossibile eliminare il dipendente.'
        );
      }
    });
  }
}