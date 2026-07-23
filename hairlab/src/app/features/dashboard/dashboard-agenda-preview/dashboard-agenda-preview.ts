import {
  DatePipe
} from '@angular/common';

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
} from '../../appointments/appointment-display';

/**
 * Anteprima reale dell'agenda di oggi.
 *
 * Visualizza al massimo cinque appuntamenti.
 */
@Component({
  selector:
    'app-dashboard-agenda-preview',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl:
    './dashboard-agenda-preview.html',
  styleUrl:
    './dashboard-agenda-preview.css'
})
export class DashboardAgendaPreviewComponent
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

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  protected readonly statusLabels =
    APPOINTMENT_STATUS_LABELS;

  /**
   * Nascondiamo gli appuntamenti cancellati
   * dall'anteprima principale.
   *
   * Restano comunque visibili nell'Agenda.
   */
  protected readonly previewAppointments =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              appointment.status !==
              AppointmentStatus.CANCELLED
          )
          .sort(
            (
              first,
              second
            ) =>
              first.startDateTime.localeCompare(
                second.startDateTime
              )
          )
          .slice(
            0,
            5
          )
    );

  ngOnInit(): void {

    const date =
      this.toDateInputValue(
        new Date()
      );

    this.loading.set(
      true
    );

    forkJoin({

      appointments:
        this.appointmentService
          .getBetween(
            `${date}T00:00:00`,
            `${date}T23:59:59`
          ),

      customers:
        this.customerService
          .getAll()

    }).subscribe({

      next: result => {

        this.appointments.set(
          result.appointments ?? []
        );

        this.customers.set(
          result.customers ?? []
        );

        this.loading.set(
          false
        );
      },

      error: () => {

        this.error.set(
          'Impossibile caricare l’agenda di oggi.'
        );

        this.loading.set(
          false
        );
      }
    });
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

    return (
      `${year}-${month}-${day}`
    );
  }
}
