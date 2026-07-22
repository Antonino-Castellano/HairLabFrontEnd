import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  Observable
} from 'rxjs';

import {
  Customer
} from '../../../models/customer';

import {
  CustomerService
} from '../../../service/customer-service';

/**
 * Filtri disponibili nella pagina clienti.
 */
type CustomerStatusFilter =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ALL';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerListComponent
  implements OnInit {

  private readonly customerService =
    inject(CustomerService);

  /**
   * Clienti visualizzati nella tabella.
   */
  protected readonly customers =
    signal<Customer[]>([]);

  /**
   * Filtro corrente.
   *
   * Di default mostriamo solamente
   * i clienti attivi.
   */
  protected readonly selectedFilter =
    signal<CustomerStatusFilter>(
      'ACTIVE'
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly successMessage =
    signal('');

  ngOnInit(): void {

    this.loadCustomers();
  }

  /**
   * Gestisce il selettore:
   *
   * ACTIVE
   * INACTIVE
   * ALL
   */
  protected onFilterChange(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    const value =
      select.value as CustomerStatusFilter;

    this.selectedFilter.set(
      value
    );

    this.loadCustomers();
  }

  /**
   * Carica i clienti in base
   * al filtro selezionato.
   */
  protected loadCustomers(): void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    let request:
      Observable<Customer[]>;

    switch (
      this.selectedFilter()
    ) {

      case 'INACTIVE':

        request =
          this.customerService
            .getInactive();

        break;

      case 'ALL':

        request =
          this.customerService
            .getAll();

        break;

      case 'ACTIVE':

      default:

        request =
          this.customerService
            .getActive();

        break;
    }

    request.subscribe({

      next: (
        customers: Customer[]
      ) => {

        this.customers.set(
          customers ?? []
        );

        this.loading.set(
          false
        );
      },

      error: (
        error: HttpErrorResponse
      ) => {

        this.loading.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile caricare i clienti.'
          )
        );
      }
    });
  }

  /**
   * Disattiva il cliente.
   */
  protected deactivateCustomer(
    customer: Customer
  ): void {

    if (
      !customer.id
    ) {
      return;
    }

    const confirmed =
      confirm(
        `Vuoi disattivare ` +
        `${customer.firstName} ` +
        `${customer.lastName}?\n\n` +
        `Il cliente resterà nel database ` +
        `e conserverà tutto lo storico.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    this.clearMessages();

    this.customerService
      .deactivate(
        customer.id
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Cliente disattivato correttamente.'
          );

          /*
           * Se stiamo guardando gli attivi,
           * il cliente appena disattivato
           * sparirà dalla lista.
           */
          this.loadCustomers();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile disattivare il cliente.'
            )
          );
        }
      });
  }

  /**
   * Riattiva il cliente.
   */
  protected activateCustomer(
    customer: Customer
  ): void {

    if (
      !customer.id
    ) {
      return;
    }

    this.clearMessages();

    this.customerService
      .activate(
        customer.id
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Cliente riattivato correttamente.'
          );

          /*
           * Se stiamo guardando i disattivati,
           * il cliente riattivato
           * sparirà automaticamente dalla lista.
           */
          this.loadCustomers();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile riattivare il cliente.'
            )
          );
        }
      });
  }

  /**
   * Elimina DEFINITIVAMENTE
   * il cliente.
   *
   * Il pulsante è disponibile sia
   * per clienti attivi sia disattivati.
   *
   * Il backend blocca comunque
   * l'eliminazione se esiste storico.
   */
  protected deleteCustomer(
    customer: Customer
  ): void {

    if (
      !customer.id
    ) {
      return;
    }

    const confirmed =
      confirm(
        `ATTENZIONE\n\n` +
        `Vuoi eliminare definitivamente ` +
        `${customer.firstName} ` +
        `${customer.lastName}?\n\n` +
        `Questa operazione rimuove realmente ` +
        `il cliente dal database e non può ` +
        `essere annullata.\n\n` +
        `Se il cliente possiede storico, ` +
        `HairLab bloccherà automaticamente ` +
        `l'eliminazione.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    this.clearMessages();

    this.customerService
      .delete(
        customer.id
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Cliente eliminato definitivamente.'
          );

          this.loadCustomers();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile eliminare definitivamente il cliente.'
            )
          );
        }
      });
  }

  /**
   * Restituisce le iniziali
   * da usare come fallback avatar.
   */
  protected getCustomerInitials(
    customer: Customer
  ): string {

    const firstNameInitial =
      customer.firstName
        ? customer.firstName
            .charAt(0)
            .toUpperCase()
        : '';

    const lastNameInitial =
      customer.lastName
        ? customer.lastName
            .charAt(0)
            .toUpperCase()
        : '';

    return (
      `${firstNameInitial}${lastNameInitial}` ||
      '?'
    );
  }

  /**
   * Testo mostrato nello stato vuoto.
   */
  protected getEmptyMessage(): string {

    switch (
      this.selectedFilter()
    ) {

      case 'INACTIVE':

        return (
          'Non ci sono clienti disattivati.'
        );

      case 'ALL':

        return (
          'Non ci sono clienti registrati.'
        );

      case 'ACTIVE':

      default:

        return (
          'Non ci sono clienti attivi.'
        );
    }
  }

  private clearMessages(): void {

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );
  }

  /**
   * Recupera il messaggio restituito
   * dal GlobalExceptionHandler.
   */
  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const backendMessage =
      error.error?.message;

    if (
      typeof backendMessage === 'string' &&
      backendMessage.trim()
    ) {

      return backendMessage;
    }

    if (
      error.status === 401
    ) {

      return (
        'Sessione scaduta o autenticazione non valida.'
      );
    }

    if (
      error.status === 403
    ) {

      return (
        'Non hai i permessi necessari per questa operazione.'
      );
    }

    if (
      error.status === 0
    ) {

      return (
        'Impossibile comunicare con il backend.'
      );
    }

    return fallback;
  }
}
