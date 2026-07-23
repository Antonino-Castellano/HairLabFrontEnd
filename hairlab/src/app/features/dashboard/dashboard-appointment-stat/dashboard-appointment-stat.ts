import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  Appointment
} from '../../../models/appointment';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

import {
  AppointmentService
} from '../../../service/appointment-service';

/**
 * Numero reale degli appuntamenti di oggi.
 *
 * Il componente è separato dalla Dashboard
 * per ridurre i conflitti Git con altri moduli.
 */
@Component({
  selector:
    'app-dashboard-appointment-stat',
  standalone: true,
  imports: [],
  templateUrl:
    './dashboard-appointment-stat.html',
  styleUrl:
    './dashboard-appointment-stat.css'
})
export class DashboardAppointmentStatComponent
  implements OnInit {

  private readonly appointmentService =
    inject(
      AppointmentService
    );

  protected readonly appointments =
    signal<Appointment[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal('');

  /**
   * Non contiamo come appuntamenti operativi
   * quelli cancellati.
   */
  protected readonly count =
    computed(
      () =>
        this.appointments()
          .filter(
            appointment =>
              appointment.status !==
              AppointmentStatus.CANCELLED
          )
          .length
    );

  ngOnInit(): void {

    const date =
      this.toDateInputValue(
        new Date()
      );

    this.loading.set(
      true
    );

    this.appointmentService
      .getBetween(
        `${date}T00:00:00`,
        `${date}T23:59:59`
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

        error: () => {

          this.error.set(
            'Dato non disponibile'
          );

          this.loading.set(
            false
          );
        }
      });
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
