import {
  DatePipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin,
  Observable
} from 'rxjs';

import {
  Appointment
} from '../../../models/appointment';

import {
  Customer
} from '../../../models/customer';

import {
  Employee
} from '../../../models/employee';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

import {
  AppointmentQueryService
} from '../../../service/appointment-query-service';

import {
  AppointmentService
} from '../../../service/appointment-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  EmployeeService
} from '../../../service/employee-service';

import {
  APPOINTMENT_STATUS_LABELS
} from '../appointment-display';


import {
  AppointmentOperatorTimelineComponent
} from '../appointment-operator-timeline/appointment-operator-timeline';

/**
 * Modalità visuale dell'Agenda.
 */
type AgendaViewMode =
  | 'DAY'
  | 'WEEK'
  | 'OPERATORS';

/**
 * Filtro tecnico per stato.
 */
type AppointmentStatusFilter =
  | 'ALL'
  | AppointmentStatus;

/**
 * Filtro operativo.
 *
 * Serve a rispondere velocemente a domande come:
 *
 * - quali clienti devono ancora arrivare?
 * - chi è in ritardo?
 * - quali appuntamenti sono in corso?
 * - quali sono già chiusi?
 */
type AgendaOperationalFilter =
  | 'ALL'
  | 'UPCOMING'
  | 'LATE'
  | 'IN_PROGRESS'
  | 'FINISHED';

/**
 * Stato persistito della toolbar.
 *
 * Usiamo sessionStorage:
 *
 * - tornando da Dettaglio -> Agenda
 *   ritroviamo i filtri;
 *
 * - chiudendo la scheda browser
 *   la sessione viene naturalmente azzerata.
 */
interface AgendaStoredState {

  selectedDate:
    string;

  viewMode:
    AgendaViewMode;

  statusFilter:
    AppointmentStatusFilter;

  employeeFilterId:
    number | null;

  searchText:
    string;

  operationalFilter:
    AgendaOperationalFilter;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    AppointmentOperatorTimelineComponent
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css'
})
export class AppointmentListComponent
  implements OnInit, OnDestroy {

  /**
   * Chiave unica usata per salvare
   * i filtri durante la sessione.
   */
  private readonly storageKey =
    'hairlab.appointments.agenda.filters.v1';

  private readonly appointmentService =
    inject(
      AppointmentService
    );

  private readonly appointmentQueryService =
    inject(
      AppointmentQueryService
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  private readonly employeeService =
    inject(
      EmployeeService
    );

  /**
   * Timer che aggiorna il concetto di "adesso".
   *
   * Serve soprattutto per evidenziare
   * automaticamente gli appuntamenti in ritardo.
   */
  private nowTimer:
    ReturnType<typeof setInterval> |
    null =
      null;

  protected readonly appointments =
    signal<Appointment[]>([]);

  protected readonly customers =
    signal<Customer[]>([]);

  /**
   * Mostriamo anche operatori disattivati
   * per poter consultare lo storico.
   */
  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly selectedDate =
    signal(
      this.toDateInputValue(
        new Date()
      )
    );

  protected readonly viewMode =
    signal<AgendaViewMode>(
      'DAY'
    );

  protected readonly statusFilter =
    signal<AppointmentStatusFilter>(
      'ALL'
    );

  /**
   * null = tutti gli operatori.
   */
  protected readonly employeeFilterId =
    signal<number | null>(
      null
    );

  /**
   * Ricerca libera:
   *
   * - nome cliente;
   * - cognome;
   * - note;
   * - ID appuntamento.
   */
  protected readonly searchText =
    signal('');

  /**
   * Filtro operativo rapido.
   */
  protected readonly operationalFilter =
    signal<AgendaOperationalFilter>(
      'ALL'
    );

  /**
   * Timestamp aggiornato ogni minuto.
   */
  protected readonly nowTimestamp =
    signal(
      Date.now()
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly successMessage =
    signal('');

  protected readonly statusLabels =
    APPOINTMENT_STATUS_LABELS;

  protected readonly AppointmentStatus =
    AppointmentStatus;

  /**
   * Appuntamenti futuri ancora operativi.
   */
  protected readonly upcomingCount =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              this.isUpcoming(
                appointment
              )
          )
          .length
    );

  /**
   * Appuntamenti che avrebbero già
   * dovuto iniziare ma sono ancora
   * BOOKED o CONFIRMED.
   */
  protected readonly lateCount =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              this.isLate(
                appointment
              )
          )
          .length
    );

  /**
   * Appuntamenti attualmente
   * in lavorazione.
   */
  protected readonly inProgressCount =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              appointment.status ===
              AppointmentStatus.IN_PROGRESS
          )
          .length
    );

  /**
   * Stati terminali.
   */
  protected readonly finishedCount =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              this.isFinished(
                appointment
              )
          )
          .length
    );

  /**
   * Pipeline completa dei filtri frontend:
   *
   * 1. stato;
   * 2. ricerca testuale;
   * 3. filtro operativo.
   *
   * Il filtro operatore viene invece eseguito
   * dal backend perché passa dagli AppointmentItem.
   */
  protected readonly filteredAppointments =
    computed(
      () => {

        const statusFilter =
          this.statusFilter();

        const search =
          this.normalizeSearch(
            this.searchText()
          );

        const operationalFilter =
          this.operationalFilter();

        return this.appointments()
          .filter(
            appointment => {

              if (
                statusFilter !== 'ALL' &&
                appointment.status !==
                  statusFilter
              ) {

                return false;
              }

              if (
                search &&
                !this.matchesSearch(
                  appointment,
                  search
                )
              ) {

                return false;
              }

              return this.matchesOperationalFilter(
                appointment,
                operationalFilter
              );
            }
          );
      }
    );

  /**
   * Sette giorni della settimana corrente.
   */
  protected readonly weekDays =
    computed(
      () => {

        const monday =
          this.getMonday(
            this.selectedDate()
          );

        return Array.from(
          {
            length: 7
          },
          (
            _,
            index
          ) =>
            this.addDays(
              monday,
              index
            )
        );
      }
    );

  ngOnInit(): void {

    /*
     * Ripristiniamo prima i filtri,
     * poi effettuiamo la query.
     */
    this.restoreState();

    this.startClock();

    this.loadAgenda();
  }

  ngOnDestroy(): void {

    if (
      this.nowTimer
    ) {

      clearInterval(
        this.nowTimer
      );
    }
  }

  /**
   * Cambia vista Giorno / Settimana.
   */
  protected setViewMode(
    mode: AgendaViewMode
  ): void {

    if (
      this.viewMode() ===
      mode
    ) {

      return;
    }

    this.viewMode.set(
      mode
    );

    this.persistState();

    this.loadAgenda();
  }

  /**
   * Filtro stato.
   */
  protected onStatusFilterChange(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;

    this.statusFilter.set(
      select.value as
        AppointmentStatusFilter
    );

    this.persistState();
  }

  /**
   * Filtro operatore.
   *
   * Richiede una nuova query al backend.
   */
  protected onEmployeeFilterChange(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;

    this.employeeFilterId.set(
      select.value
        ? Number(
            select.value
          )
        : null
    );

    this.persistState();

    this.loadAgenda();
  }

  /**
   * Ricerca cliente / note.
   *
   * È un filtro locale,
   * quindi non richiede una nuova HTTP call.
   */
  protected onSearchInput(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.searchText.set(
      input.value
    );

    this.persistState();
  }

  /**
   * Seleziona il filtro operativo.
   */
  protected setOperationalFilter(
    filter: AgendaOperationalFilter
  ): void {

    this.operationalFilter.set(
      filter
    );

    this.persistState();
  }

  /**
   * Azzera i filtri,
   * mantenendo però:
   *
   * - giorno corrente selezionato;
   * - modalità Giorno/Settimana.
   */
  protected resetFilters(): void {

    const hadEmployeeFilter =
      this.employeeFilterId() !==
      null;

    this.statusFilter.set(
      'ALL'
    );

    this.employeeFilterId.set(
      null
    );

    this.searchText.set(
      ''
    );

    this.operationalFilter.set(
      'ALL'
    );

    this.persistState();

    /*
     * Se prima filtravamo per dipendente,
     * dobbiamo ricaricare tutti gli appuntamenti.
     */
    if (
      hadEmployeeFilter
    ) {

      this.loadAgenda();
    }
  }

  /**
   * Carica lookup + appuntamenti.
   */
  protected loadAgenda(): void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    const range =
      this.getCurrentRange();

    const appointmentRequest =
      this.buildAppointmentRequest(
        range.start,
        range.end
      );

    forkJoin({

      customers:
        this.customerService
          .getAll(),

      employees:
        this.employeeService
          .getAll(),

      appointments:
        appointmentRequest

    }).subscribe({

      next: result => {

        this.customers.set(
          result.customers ??
          []
        );

        this.employees.set(
          result.employees ??
          []
        );

        this.appointments.set(
          result.appointments ??
          []
        );

        this.nowTimestamp.set(
          Date.now()
        );

        this.loading.set(
          false
        );
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.loading.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile caricare l’agenda.'
          )
        );
      }
    });
  }

  /**
   * Sceglie l'endpoint corretto.
   */
  private buildAppointmentRequest(
    start: string,
    end: string
  ): Observable<Appointment[]> {

    const employeeId =
      this.employeeFilterId();

    if (
      employeeId
    ) {

      return this.appointmentQueryService
        .getByEmployeeBetween(
          employeeId,
          start,
          end
        );
    }

    return this.appointmentService
      .getBetween(
        start,
        end
      );
  }

  protected previousPeriod():
    void {

    const amount =
      this.viewMode() ===
      'WEEK'
        ? -7
        : -1;

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        amount
      )
    );

    this.persistState();

    this.loadAgenda();
  }

  protected nextPeriod():
    void {

    const amount =
      this.viewMode() ===
      'WEEK'
        ? 7
        : 1;

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        amount
      )
    );

    this.persistState();

    this.loadAgenda();
  }

  protected goToday():
    void {

    this.selectedDate.set(
      this.toDateInputValue(
        new Date()
      )
    );

    this.persistState();

    this.loadAgenda();
  }

  protected onDateChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.selectedDate.set(
      input.value
    );

    this.persistState();

    this.loadAgenda();
  }

  /**
   * Restituisce il nome leggibile del cliente.
   */
  protected getCustomerName(
    customerId: number
  ): string {

    const customer =
      this.customers()
        .find(
          item =>
            item.id ===
            customerId
        );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : `Cliente #${customerId}`;
  }

  /**
   * Appuntamenti filtrati
   * del singolo giorno.
   */
  protected getAppointmentsForDay(
    date: string
  ): Appointment[] {

    return this.filteredAppointments()
      .filter(
        appointment =>
          appointment
            .startDateTime
            .substring(
              0,
              10
            ) ===
          date
      );
  }

  /**
   * TRUE quando:
   *
   * - stato BOOKED / CONFIRMED;
   * - orario già trascorso.
   */
  protected isLate(
    appointment: Appointment
  ): boolean {

    const statusIsWaiting =
      appointment.status ===
        AppointmentStatus.BOOKED ||
      appointment.status ===
        AppointmentStatus.CONFIRMED;

    if (
      !statusIsWaiting
    ) {

      return false;
    }

    return (
      new Date(
        appointment.startDateTime
      ).getTime() <
      this.nowTimestamp()
    );
  }

  /**
   * TRUE quando è ancora futuro
   * e operativo.
   */
  protected isUpcoming(
    appointment: Appointment
  ): boolean {

    const statusIsWaiting =
      appointment.status ===
        AppointmentStatus.BOOKED ||
      appointment.status ===
        AppointmentStatus.CONFIRMED;

    if (
      !statusIsWaiting
    ) {

      return false;
    }

    return (
      new Date(
        appointment.startDateTime
      ).getTime() >=
      this.nowTimestamp()
    );
  }

  /**
   * TRUE per gli stati terminali.
   */
  protected isFinished(
    appointment: Appointment
  ): boolean {

    return (
      appointment.status ===
        AppointmentStatus.COMPLETED ||
      appointment.status ===
        AppointmentStatus.CANCELLED ||
      appointment.status ===
        AppointmentStatus.NO_SHOW
    );
  }

  protected cancelAppointment(
    appointment: Appointment
  ): void {

    if (
      !appointment.id
    ) {

      return;
    }

    const confirmed =
      confirm(
        'Vuoi cancellare questo appuntamento?\n\n' +
        'Lo storico resterà nel database con stato CANCELLATO.'
      );

    if (
      !confirmed
    ) {

      return;
    }

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );

    this.appointmentService
      .delete(
        appointment.id
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Appuntamento cancellato correttamente.'
          );

          this.loadAgenda();
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile cancellare l’appuntamento.'
            )
          );
        }
      });
  }

  protected canCancel(
    appointment: Appointment
  ): boolean {

    return (
      appointment.status ===
        AppointmentStatus.BOOKED ||
      appointment.status ===
        AppointmentStatus.CONFIRMED
    );
  }

  protected canEdit(
    appointment: Appointment
  ): boolean {

    return this.canCancel(
      appointment
    );
  }

  /**
   * Verifica il filtro operativo.
   */
  private matchesOperationalFilter(
    appointment: Appointment,
    filter: AgendaOperationalFilter
  ): boolean {

    switch (
      filter
    ) {

      case 'UPCOMING':

        return this.isUpcoming(
          appointment
        );

      case 'LATE':

        return this.isLate(
          appointment
        );

      case 'IN_PROGRESS':

        return (
          appointment.status ===
          AppointmentStatus.IN_PROGRESS
        );

      case 'FINISHED':

        return this.isFinished(
          appointment
        );

      case 'ALL':

      default:

        return true;
    }
  }

  /**
   * Ricerca:
   *
   * nome/cognome cliente,
   * note,
   * ID appuntamento.
   */
  private matchesSearch(
    appointment: Appointment,
    search: string
  ): boolean {

    const customerName =
      this.normalizeSearch(
        this.getCustomerName(
          appointment.customerId
        )
      );

    const notes =
      this.normalizeSearch(
        appointment.notes ??
        ''
      );

    const appointmentId =
      String(
        appointment.id ??
        ''
      );

    return (
      customerName.includes(
        search
      ) ||
      notes.includes(
        search
      ) ||
      appointmentId.includes(
        search
      )
    );
  }

  private normalizeSearch(
    value: string
  ): string {

    return value
      .trim()
      .toLocaleLowerCase();
  }

  /**
   * Range corrente.
   */
  private getCurrentRange(): {
    start: string;
    end: string;
  } {

    if (
      this.viewMode() ===
        'DAY'
      ||
      this.viewMode() ===
        'OPERATORS'
    ) {

      return {

        start:
          `${this.selectedDate()}T00:00:00`,

        end:
          `${this.selectedDate()}T23:59:59`
      };
    }

    const monday =
      this.getMonday(
        this.selectedDate()
      );

    const sunday =
      this.addDays(
        monday,
        6
      );

    return {

      start:
        `${monday}T00:00:00`,

      end:
        `${sunday}T23:59:59`
    };
  }

  private getMonday(
    value: string
  ): string {

    const date =
      new Date(
        `${value}T12:00:00`
      );

    const day =
      date.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    date.setDate(
      date.getDate() +
      difference
    );

    return this.toDateInputValue(
      date
    );
  }

  private addDays(
    value: string,
    amount: number
  ): string {

    const date =
      new Date(
        `${value}T12:00:00`
      );

    date.setDate(
      date.getDate() +
      amount
    );

    return this.toDateInputValue(
      date
    );
  }

  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() +
        1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return (
      `${year}-${month}-${day}`
    );
  }

  /**
   * Aggiorna "adesso" ogni minuto.
   */
  private startClock(): void {

    if (
      typeof window ===
      'undefined'
    ) {

      return;
    }

    this.nowTimer =
      window.setInterval(
        () => {

          this.nowTimestamp.set(
            Date.now()
          );
        },
        60_000
      );
  }

  /**
   * Salva filtri e vista.
   */
  private persistState(): void {

    if (
      typeof window ===
      'undefined'
    ) {

      return;
    }

    const state:
      AgendaStoredState = {

      selectedDate:
        this.selectedDate(),

      viewMode:
        this.viewMode(),

      statusFilter:
        this.statusFilter(),

      employeeFilterId:
        this.employeeFilterId(),

      searchText:
        this.searchText(),

      operationalFilter:
        this.operationalFilter()
    };

    window.sessionStorage.setItem(
      this.storageKey,
      JSON.stringify(
        state
      )
    );
  }

  /**
   * Ripristina lo stato precedente.
   *
   * In caso di dati corrotti,
   * torna semplicemente ai default.
   */
  private restoreState(): void {

    if (
      typeof window ===
      'undefined'
    ) {

      return;
    }

    const raw =
      window.sessionStorage.getItem(
        this.storageKey
      );

    if (
      !raw
    ) {

      return;
    }

    try {

      const saved =
        JSON.parse(
          raw
        ) as
          Partial<AgendaStoredState>;

      if (
        saved.selectedDate &&
        /^\d{4}-\d{2}-\d{2}$/
          .test(
            saved.selectedDate
          )
      ) {

        this.selectedDate.set(
          saved.selectedDate
        );
      }

      if (
        saved.viewMode ===
          'DAY' ||
        saved.viewMode ===
          'WEEK'
      ) {

        this.viewMode.set(
          saved.viewMode
        );
      }

      if (
        saved.statusFilter
      ) {

        this.statusFilter.set(
          saved.statusFilter
        );
      }

      if (
        typeof saved.employeeFilterId ===
          'number' ||
        saved.employeeFilterId ===
          null
      ) {

        this.employeeFilterId.set(
          saved.employeeFilterId ??
          null
        );
      }

      if (
        typeof saved.searchText ===
        'string'
      ) {

        this.searchText.set(
          saved.searchText
        );
      }

      if (
        saved.operationalFilter ===
          'ALL' ||
        saved.operationalFilter ===
          'UPCOMING' ||
        saved.operationalFilter ===
          'LATE' ||
        saved.operationalFilter ===
          'IN_PROGRESS' ||
        saved.operationalFilter ===
          'FINISHED'
      ) {

        this.operationalFilter.set(
          saved.operationalFilter
        );
      }

    } catch {

      window.sessionStorage.removeItem(
        this.storageKey
      );
    }
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const backendMessage =
      error.error?.message;

    if (
      typeof backendMessage ===
        'string' &&
      backendMessage.trim()
    ) {

      return backendMessage;
    }

    if (
      error.status ===
      0
    ) {

      return (
        'Impossibile comunicare con il backend.'
      );
    }

    return fallback;
  }
}
