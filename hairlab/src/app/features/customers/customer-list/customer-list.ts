import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Customer } from '../../../models/customer';
import { CustomerService } from '../../../service/customer-service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  /**
   * Quando il componente viene inizializzato
   * recupera automaticamente i clienti dal backend.
   */
  ngOnInit(): void {
    this.loadCustomers();
  }

  /**
   * Recupera tutti i clienti tramite CustomerService.
   */
  protected loadCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService.getAll().subscribe({
      next: (customers: Customer[]) => {
        this.customers.set(customers ?? []);
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
            'Non hai i permessi per visualizzare i clienti.'
          );
        } else if (error.status === 404) {
          this.errorMessage.set(
            'Endpoint clienti non trovato.'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'Impossibile comunicare con il backend.'
          );
        } else {
          this.errorMessage.set(
            'Impossibile caricare i clienti.'
          );
        }
      }
    });
  }

  /**
   * Crea le iniziali utilizzate nell'avatar del cliente.
   */
  protected getCustomerInitials(customer: Customer): string {
    const firstNameInitial = customer.firstName
      ? customer.firstName.charAt(0).toUpperCase()
      : '';

    const lastNameInitial = customer.lastName
      ? customer.lastName.charAt(0).toUpperCase()
      : '';

    return `${firstNameInitial}${lastNameInitial}` || '?';
  }

  /**
   * Elimina il cliente selezionato dopo una conferma.
   * Dopo l'eliminazione ricarica la lista aggiornata.
   */
  protected deleteCustomer(customer: Customer): void {
    if (!customer.id) {
      return;
    }

    const confirmed = confirm(
      `Vuoi eliminare ${customer.firstName} ${customer.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    this.customerService.delete(customer.id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: () => {
        this.errorMessage.set(
          'Impossibile eliminare il cliente.'
        );
      }
    });
  }
}