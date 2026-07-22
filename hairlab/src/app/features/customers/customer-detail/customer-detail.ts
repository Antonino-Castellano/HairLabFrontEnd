import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Customer } from '../../../models/customer';
import { CustomerService } from '../../../service/customer-service';
import { HairProfileDetailComponent } from '../hair-profile/hair-profile-detail/hair-profile-detail';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink,HairProfileDetailComponent],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css'
})
export class CustomerDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customerService = inject(CustomerService);

  /**
   * Cliente recuperato dal backend.
   * All'inizio è null perché la richiesta HTTP
   * non è ancora stata completata.
   */
  protected readonly customer = signal<Customer | null>(null);

  /**
   * Indica se è in corso il caricamento del cliente.
   */
  protected readonly loading = signal(false);

  /**
   * Contiene un eventuale messaggio di errore
   * da mostrare nella pagina.
   */
  protected readonly errorMessage = signal('');

  /**
   * Quando Angular inizializza il componente,
   * recupera l'ID del cliente presente nell'URL.
   *
   * Esempio:
   * /customers/1
   *
   * id = 1
   */
  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage.set('ID cliente non presente.');
      return;
    }

    const id = Number(idParam);

    if (Number.isNaN(id) || id <= 0) {
      this.errorMessage.set('ID cliente non valido.');
      return;
    }

    this.loadCustomer(id);
  }

  /**
   * Recupera dal backend il cliente corrispondente
   * all'ID ricevuto dalla route.
   */
  private loadCustomer(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerService.getById(id).subscribe({
      next: (customer: Customer) => {
        /*
         * Salva nel Signal il cliente ricevuto.
         * Angular aggiorna automaticamente il template.
         */
        this.customer.set(customer);

        /*
         * Il caricamento è terminato.
         */
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
            'Non hai i permessi per visualizzare questo cliente.'
          );
        } else if (error.status === 404) {
          this.errorMessage.set(
            'Cliente non trovato.'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'Impossibile comunicare con il backend.'
          );
        } else {
          this.errorMessage.set(
            'Impossibile caricare il cliente.'
          );
        }
      }
    });
  }

  /**
   * Restituisce in modo sicuro le iniziali
   * del cliente utilizzate nell'avatar.
   *
   * Esempio:
   * Maria Esposito -> ME
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
}