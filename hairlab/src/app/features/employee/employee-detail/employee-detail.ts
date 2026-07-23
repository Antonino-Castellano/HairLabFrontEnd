import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Employee } from '../../../models/employee';
import { EmployeeService } from '../../../service/employee-service';

type EmployeeDetailSection = 'overview' | 'info';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css'
})
export class EmployeeDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly activeSection = signal<EmployeeDetailSection>('overview');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (!idParam) {
        this.errorMessage.set('ID dipendente non presente.');
        return;
      }

      const id = Number(idParam);

      if (Number.isNaN(id) || id <= 0) {
        this.errorMessage.set('ID dipendente non valido.');
        return;
      }

      this.loadEmployee(id);
    });
  }

  private loadEmployee(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.employeeService.getById(id).subscribe({
      next: (employee: Employee) => {
        this.employee.set(employee);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);

        if (error.status === 401) {
          this.errorMessage.set('Sessione scaduta o autenticazione non valida.');
        } else if (error.status === 403) {
          this.errorMessage.set('Non hai i permessi per visualizzare questo dipendente.');
        } else if (error.status === 404) {
          this.errorMessage.set('Dipendente non trovato.');
        } else if (error.status === 0) {
          this.errorMessage.set('Impossibile comunicare con il backend.');
        } else {
          this.errorMessage.set('Impossibile caricare il dipendente.');
        }
      }
    });
  }

  protected selectSection(section: EmployeeDetailSection): void {
    this.activeSection.set(section);
  }

  protected isSectionActive(section: EmployeeDetailSection): boolean {
    return this.activeSection() === section;
  }

  protected getEmployeeInitials(employee: Employee): string {
    const firstNameInitial = employee.firstName ? employee.firstName.charAt(0).toUpperCase() : '';
    const lastNameInitial = employee.lastName ? employee.lastName.charAt(0).toUpperCase() : '';
    return `${firstNameInitial}${lastNameInitial}` || '?';
  }
}