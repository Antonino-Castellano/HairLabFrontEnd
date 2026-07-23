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
  OnInit,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  Appointment
} from '../../../models/appointment';

import {
  Customer
} from '../../../models/customer';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

import {
  AppointmentService
} from '../../../service/appointment-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  APPOINTMENT_STATUS_LABELS
} from '../appointment-display';

type AgendaViewMode =
  | 'DAY'
  | 'WEEK';

type AppointmentStatusFilter =
  | 'ALL'
  | AppointmentStatus;

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css'
})
export class AppointmentListComponent
  implements OnInit {

  private readonly appointmentService =
    inject(
      AppointmentService
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  protected readonly appointments =
    signal<Appointment[]>([]);

  protected readonly customers =
    signal<Customer[]>([]);

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
   * Lista filtrata per stato.
   */
  protected readonly filteredAppointments =
    computed(
      () => {

        const filter =
          this.statusFilter();

        if (
          filter === 'ALL'
        ) {

          return this.appointments();
        }

        return this.appointments()
          .filter(
            appointment =>
              appointment.status ===
              filter
          );
      }
    );

  /**
   * I sette giorni della settimana
   * contenente selectedDate.
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

    this.loadAgenda();
  }

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

    this.loadAgenda();
  }

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
  }

  protected loadAgenda(): void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    const range =
      this.getCurrentRange();

    forkJoin({

      customers:
        this.customerService
          .getAll(),

      appointments:
        this.appointmentService
          .getBetween(
            range.start,
            range.end
          )

    }).subscribe({

      next: result => {

        this.customers.set(
          result.customers ??
          []
        );

        this.appointments.set(
          result.appointments ??
          []
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

  protected previousPeriod():
    void {

    const amount =
      this.viewMode() ===
      'DAY'
        ? -1
        : -7;

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        amount
      )
    );

    this.loadAgenda();
  }

  protected nextPeriod():
    void {

    const amount =
      this.viewMode() ===
      'DAY'
        ? 1
        : 7;

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        amount
      )
    );

    this.loadAgenda();
  }

  protected goToday():
    void {

    this.selectedDate.set(
      this.toDateInputValue(
        new Date()
      )
    );

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

    this.loadAgenda();
  }

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
   * Appuntamenti del singolo giorno
   * usati nella vista settimanale.
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

  private getCurrentRange(): {
    start: string;
    end: string;
  } {

    if (
      this.viewMode() ===
      'DAY'
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
