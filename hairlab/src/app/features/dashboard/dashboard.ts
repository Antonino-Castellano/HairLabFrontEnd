import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { Customer } from '../../models/customer';
import { Employee } from '../../models/employee';
import {DashboardAppointmentStatComponent} from './dashboard-appointment-stat/dashboard-appointment-stat';
import {DashboardAgendaPreviewComponent} from './dashboard-agenda-preview/dashboard-agenda-preview';
import { CustomerService } from '../../service/customer-service';
import { EmployeeService } from '../../service/employee-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DashboardAppointmentStatComponent,DashboardAgendaPreviewComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);
  private readonly employeeService = inject(EmployeeService);

  protected readonly user = this.authService.getUserFromToken();

  /* ==========================================
   * CLIENTI
   * ========================================== */
  protected readonly customers = signal<Customer[]>([]);
  protected readonly loadingCustomers = signal(false);
  protected readonly customerError = signal('');

  protected readonly totalCustomerCount = computed(() => {
    return this.customers().length;
  });

  protected readonly activeCustomerCount = computed(() => {
    return this.customers().filter(customer => customer.active).length;
  });

  /* ==========================================
   * DIPENDENTI / OPERATORI
   * ========================================== */
  protected readonly employees = signal<Employee[]>([]);
  protected readonly loadingEmployees = signal(false);
  protected readonly employeeError = signal('');

  protected readonly totalEmployeeCount = computed(() => {
    return this.employees().length;
  });

  protected readonly activeEmployeeCount = computed(() => {
    return this.employees().filter(employee => employee.active).length;
  });

  ngOnInit(): void {
    this.loadCustomers();
    this.loadEmployees();
  }

  private loadCustomers(): void {
    this.loadingCustomers.set(true);
    this.customerError.set('');

    this.customerService.getAll().subscribe({
      next: (customers: Customer[]) => {
        this.customers.set(customers ?? []);
        this.loadingCustomers.set(false);
      },
      error: () => {
        this.customers.set([]);
        this.customerError.set('Impossibile caricare i dati dei clienti.');
        this.loadingCustomers.set(false);
      }
    });
  }

  private loadEmployees(): void {
    this.loadingEmployees.set(true);
    this.employeeError.set('');

    this.employeeService.getAll().subscribe({
      next: (employees: Employee[]) => {
        this.employees.set(employees ?? []);
        this.loadingEmployees.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.employeeError.set('Impossibile caricare i dati dei dipendenti.');
        this.loadingEmployees.set(false);
      }
    });
  }
}