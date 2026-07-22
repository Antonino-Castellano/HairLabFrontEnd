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
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  Customer
} from '../../../models/customer';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  ColorAnalysisDetailComponent
} from '../color-analysis/color-analysis-detail/color-analysis-detail';

import {
  FaceProfileDetailComponent
} from '../face-profile/face-profile-detail/face-profile-detail';

import {
  HairProfileDetailComponent
} from '../hair-profile/hair-profile-detail/hair-profile-detail';

import {
  StyleRecommendationDetailComponent
} from '../style-recommendation/style-recommendation-detail/style-recommendation-detail';

/**
 * Identifica le sezioni disponibili
 * all'interno della scheda cliente.
 *
 * Utilizzare un tipo specifico ci impedisce
 * di assegnare accidentalmente valori
 * non previsti.
 */
type CustomerDetailSection =
  | 'overview'
  | 'hair'
  | 'face'
  | 'color'
  | 'recommendations';

/**
 * Pagina dettaglio della cliente.
 *
 * Contiene:
 *
 * - anagrafica;
 * - avatar;
 * - profilo capelli;
 * - profilo del viso;
 * - analisi cromatica;
 * - suggerimenti HairLab;
 * - storico futuro.
 */
@Component({
  selector: 'app-customer-detail',
  standalone: true,

  imports: [
    RouterLink,
    HairProfileDetailComponent,
    FaceProfileDetailComponent,
    ColorAnalysisDetailComponent,
    StyleRecommendationDetailComponent
  ],

  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css'
})
export class CustomerDetailComponent
    implements OnInit {

  /**
   * Route corrente.
   *
   * Serve per recuperare:
   *
   * /customers/:id
   */
  private readonly activatedRoute =
    inject(ActivatedRoute);

  /**
   * Service del cliente.
   */
  private readonly customerService =
    inject(CustomerService);

  /**
   * Cliente recuperato dal backend.
   *
   * All'inizio è null perché la richiesta HTTP
   * non è ancora stata completata.
   */
  protected readonly customer =
    signal<Customer | null>(
      null
    );

  /**
   * Tab attualmente visibile.
   *
   * La pagina apre sempre la Panoramica.
   */
  protected readonly activeSection =
    signal<CustomerDetailSection>(
      'overview'
    );

  /**
   * Stato caricamento cliente.
   */
  protected readonly loading =
    signal(false);

  /**
   * Eventuale messaggio di errore.
   */
  protected readonly errorMessage =
    signal('');

  /**
   * Inizializzazione.
   */
  ngOnInit(): void {

    /**
     * La route del dettaglio cliente è:
     *
     * customers/:id
     *
     * quindi recuperiamo il parametro "id".
     */
    const idParam =
      this.activatedRoute.snapshot
        .paramMap
        .get('id');

    if (!idParam) {

      this.errorMessage.set(
        'ID cliente non presente.'
      );

      return;
    }

    const id =
      Number(idParam);

    if (
      Number.isNaN(id) ||
      id <= 0
    ) {

      this.errorMessage.set(
        'ID cliente non valido.'
      );

      return;
    }

    this.loadCustomer(
      id
    );
  }

  /**
   * Recupera dal backend il cliente.
   */
  private loadCustomer(
    id: number
  ): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.customerService
      .getById(id)
      .subscribe({

        next: (
          customer: Customer
        ) => {

          /**
           * Salviamo il cliente nel Signal.
           *
           * Angular aggiorna automaticamente
           * il template.
           */
          this.customer.set(
            customer
          );

          this.loading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.loading.set(false);

          if (
            error.status === 401
          ) {

            this.errorMessage.set(
              'Sessione scaduta o autenticazione non valida.'
            );

          } else if (
            error.status === 403
          ) {

            this.errorMessage.set(
              'Non hai i permessi per visualizzare questo cliente.'
            );

          } else if (
            error.status === 404
          ) {

            this.errorMessage.set(
              'Cliente non trovato.'
            );

          } else if (
            error.status === 0
          ) {

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
   * Cambia la sezione visibile.
   *
   * Non cambia URL.
   *
   * Restiamo sempre su:
   *
   * /customers/{id}
   */
  protected selectSection(
    section: CustomerDetailSection
  ): void {

    this.activeSection.set(
      section
    );
  }

  /**
   * Controlla se una specifica sezione
   * è attualmente selezionata.
   *
   * È utile soprattutto nel template
   * per applicare la classe CSS "active".
   */
  protected isSectionActive(
    section: CustomerDetailSection
  ): boolean {

    return (
      this.activeSection() ===
      section
    );
  }

  /**
   * Restituisce le iniziali del cliente
   * utilizzate come fallback dell'avatar.
   *
   * Esempio:
   *
   * Maria Esposito
   * ->
   * ME
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
}