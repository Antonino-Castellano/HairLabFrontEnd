import {
  HttpClient,
  HttpParams
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

import {
  AppointmentStatus
} from '../models/enums/appointment-status';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('appointment');

  getAll():
    Observable<Appointment[]> {

    return this.http.get<Appointment[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<Appointment> {

    return this.http.get<Appointment>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Storico appuntamenti del cliente.
   */
  getByCustomerId(
    customerId: number
  ): Observable<Appointment[]> {

    return this.http.get<Appointment[]>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  /**
   * Filtra gli appuntamenti per stato.
   */
  getByStatus(
    status: AppointmentStatus
  ): Observable<Appointment[]> {

    return this.http.get<Appointment[]>(
      `${this.apiUrl}/status/${status}`
    );
  }

  /**
   * Recupera gli appuntamenti compresi
   * tra due date ISO.
   */
  getBetween(
    start: string,
    end: string
  ): Observable<Appointment[]> {

    const params =
      new HttpParams()
        .set(
          'start',
          start
        )
        .set(
          'end',
          end
        );

    return this.http.get<Appointment[]>(
      `${this.apiUrl}/between`,
      {
        params
      }
    );
  }

  insert(
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http.post<Appointment>(
      this.apiUrl,
      appointment
    );
  }

  update(
    id: number,
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http.put<Appointment>(
      `${this.apiUrl}/${id}`,
      appointment
    );
  }

  /**
   * Nel backend il DELETE di un Appointment
   * lo porta allo stato CANCELLED
   * invece di distruggerne lo storico.
   */
  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
