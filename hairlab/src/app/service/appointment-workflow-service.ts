import {
  HttpClient
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  hairLabApi
} from '../core/config/api.config';

import {
  Appointment
} from '../models/appointment';

/**
 * Service dedicato al ciclo di vita
 * dell'appuntamento.
 *
 * Non usa PUT generico:
 * ogni transizione ha un endpoint esplicito.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentWorkflowService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi(
      'appointment-workflow'
    );

  /**
   * BOOKED -> CONFIRMED
   */
  confirm(
    id: number
  ): Observable<Appointment> {

    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/confirm`,
      {}
    );
  }

  /**
   * BOOKED / CONFIRMED
   * -> IN_PROGRESS
   */
  start(
    id: number
  ): Observable<Appointment> {

    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  /**
   * IN_PROGRESS -> COMPLETED
   */
  complete(
    id: number
  ): Observable<Appointment> {

    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/complete`,
      {}
    );
  }

  /**
   * BOOKED / CONFIRMED
   * -> NO_SHOW
   */
  markNoShow(
    id: number
  ): Observable<Appointment> {

    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/no-show`,
      {}
    );
  }
}
