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
  Input,
  OnChanges,
  signal,
  SimpleChanges
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  Appointment
} from '../../../models/appointment';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

import {
  AppointmentService
} from '../../../service/appointment-service';

import {
  APPOINTMENT_STATUS_LABELS
} from '../../appointments/appointment-display';

/**
 * Storico appuntamenti della scheda cliente.
 *
 * Il componente è autonomo e può essere
 * inserito come nuova tab del CustomerDetail.
 */
@Component({
  selector:
    'app-customer-appointment-history',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl:
    './customer-appointment-history.html',
  styleUrl:
    './customer-appointment-history.css'
})
export class CustomerAppointmentHistoryComponent
  implements OnChanges {

  @Input({
    required: true
  })
  customerId!: number;

  private readonly appointmentService =
    inject(
      AppointmentService
    );

  protected readonly appointments =
    signal<Appointment[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly statusLabels =
    APPOINTMENT_STATUS_LABELS;

  protected readonly AppointmentStatus =
    AppointmentStatus;

  protected readonly completedCount =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              appointment.status ===
              AppointmentStatus.COMPLETED
          )
          .length
    );

  protected readonly upcomingCount =
    computed(
      () => {

        const now =
          new Date()
            .getTime();

        return this.appointments()
          .filter(
            appointment =>
              (
                appointment.status ===
                  AppointmentStatus.BOOKED ||
                appointment.status ===
                  AppointmentStatus.CONFIRMED
              ) &&
              new Date(
                appointment.startDateTime
              ).getTime() >=
                now
          )
          .length;
      }
    );

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['customerId'] &&
      this.customerId > 0
    ) {

      this.loadAppointments();
    }
  }

  protected loadAppointments():
    void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.appointmentService
      .getByCustomerId(
        this.customerId
      )
      .subscribe({

        next: appointments => {

          this.appointments.set(
            appointments ?? []
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

          const backendMessage =
            error.error?.message;

          this.errorMessage.set(
            typeof backendMessage ===
              'string'
              ? backendMessage
              : 'Impossibile caricare lo storico appuntamenti.'
          );
        }
      });
  }
}
