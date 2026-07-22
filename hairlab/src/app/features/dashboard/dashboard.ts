import { Component,computed,inject,OnInit,signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { Customer } from '../../models/customer';
import { CustomerService } from '../../service/customer-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  /**
   * Service che gestisce l'autenticazione.
   *
   * Lo utilizziamo per recuperare dal JWT
   * le informazioni dell'utente loggato.
   */
  private readonly authService =
    inject(AuthService);

  /**
   * Service dedicato ai clienti.
   *
   * Ci permette di recuperare dal backend
   * tutti i clienti registrati nel gestionale.
   */
  private readonly customerService =
    inject(CustomerService);

  /**
   * Informazioni dell'utente attualmente autenticato.
   *
   * Servono per mostrare il messaggio:
   *
   * Bentornato, NomeUtente
   */
  protected readonly user =
    this.authService.getUserFromToken();

  /**
   * Elenco dei clienti ricevuti dal backend.
   *
   * Utilizziamo un Signal perché quando i dati cambiano
   * Angular aggiorna automaticamente il template.
   */
  protected readonly customers =
    signal<Customer[]>([]);

  /**
   * Indica se i dati della dashboard
   * sono ancora in fase di caricamento.
   */
  protected readonly loadingCustomers =
    signal(false);

  /**
   * Contiene un eventuale errore
   * nel caricamento dei clienti.
   */
  protected readonly customerError =
    signal('');

  /**
   * Numero totale dei clienti registrati.
   *
   * computed() crea un valore derivato.
   *
   * Ogni volta che cambia customers(),
   * Angular ricalcola automaticamente questo valore.
   */
  protected readonly totalCustomerCount =
    computed(() => {
      return this.customers().length;
    });

  /**
   * Numero dei soli clienti attivi.
   *
   * Filtriamo l'array mantenendo solamente
   * quelli con active === true.
   */
  protected readonly activeCustomerCount =
    computed(() => {
      return this.customers()
        .filter(
          customer => customer.active
        )
        .length;
    });

  /**
   * Metodo eseguito automaticamente
   * quando Angular crea la Dashboard.
   */
  ngOnInit(): void {
    this.loadCustomers();
  }

  /**
   * Recupera tutti i clienti dal backend.
   *
   * La richiesta sarà:
   *
   * GET
   * /hairlab/api/customer
   *
   * Dopo aver ricevuto i clienti,
   * i computed aggiorneranno automaticamente:
   *
   * - totalCustomerCount
   * - activeCustomerCount
   */
  private loadCustomers(): void {
    this.loadingCustomers.set(true);
    this.customerError.set('');

    this.customerService
      .getAll()
      .subscribe({
        next: (
          customers: Customer[]
        ) => {
          /**
           * Salviamo nel Signal
           * i clienti ricevuti.
           */
          this.customers.set(
            customers ?? []
          );

          /**
           * Il caricamento è terminato.
           */
          this.loadingCustomers.set(false);
        },

        error: () => {
          /**
           * In caso di errore mostriamo 0
           * senza bloccare tutta la dashboard.
           */
          this.customers.set([]);

          this.customerError.set(
            'Impossibile caricare i dati dei clienti.'
          );

          this.loadingCustomers.set(false);
        }
      });
  }
}