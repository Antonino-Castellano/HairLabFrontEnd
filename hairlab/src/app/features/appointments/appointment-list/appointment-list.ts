import {
  DatePipe
} from '@angular/common';

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
    inject(AppointmentService);

  private readonly customerService =
    inject(CustomerService);

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

  ngOnInit(): void {

    this.loadAgenda();
  }

  /**
   * Carica:
   *
   * - clienti;
   * - appuntamenti della giornata.
   */
  protected loadAgenda(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    const start =
      `${this.selectedDate()}T00:00:00`;

    const end =
      `${this.addDays(
        this.selectedDate(),
        1
      )}T00:00:00`;

    forkJoin({

      customers:
        this.customerService.getAll(),

      appointments:
        this.appointmentService
          .getBetween(
            start,
            end
          )

    }).subscribe({

      next: result => {

        this.customers.set(
          result.customers ?? []
        );

        this.appointments.set(
          result.appointments ?? []
        );

        this.loading.set(false);
      },

      error: (
        error: HttpErrorResponse
      ) => {

        this.loading.set(false);

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile caricare l’agenda.'
          )
        );
      }
    });
  }

  protected previousDay(): void {

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        -1
      )
    );

    this.loadAgenda();
  }

  protected nextDay(): void {

    this.selectedDate.set(
      this.addDays(
        this.selectedDate(),
        1
      )
    );

    this.loadAgenda();
  }

  protected goToday(): void {

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
      event.target as HTMLInputElement;

    this.selectedDate.set(
      input.value
    );

    this.loadAgenda();
  }

  /**
   * Nome cliente leggibile.
   */
  protected getCustomerName(
    customerId: number
  ): string {

    const customer =
      this.customers()
        .find(
          item =>
            item.id === customerId
        );

    if (!customer) {

      return `Cliente #${customerId}`;
    }

    return (
      `${customer.firstName} ` +
      `${customer.lastName}`
    );
  }

  /**
   * Cancella logicamente
   * un appuntamento.
   */
  protected cancelAppointment(
    appointment: Appointment
  ): void {

    if (!appointment.id) {
      return;
    }

    const confirmed =
      confirm(
        'Vuoi cancellare questo appuntamento?\n\n' +
        'Lo storico resterà nel database con stato CANCELLATO.'
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

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
          error: HttpErrorResponse
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
      appointment.status !==
        AppointmentStatus.CANCELLED &&
      appointment.status !==
        AppointmentStatus.COMPLETED
    );
  }

  protected canEdit(
    appointment: Appointment
  ): boolean {

    return (
      appointment.status !==
        AppointmentStatus.CANCELLED &&
      appointment.status !==
        AppointmentStatus.COMPLETED
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
      date.getDate() + amount
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
        date.getMonth() + 1
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

    return `${year}-${month}-${day}`;
  }

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

    if (error.status === 0) {

      return (
        'Impossibile comunicare con il backend.'
      );
    }

    return fallback;
  }
}
