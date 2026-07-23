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

/**
 * Query avanzate dell'agenda.
 *
 * Separiamo le query di ricerca
 * dal CRUD principale AppointmentService.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentQueryService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi(
      'appointment-query'
    );

  /**
   * Recupera gli appuntamenti
   * nei quali l'operatore indicato
   * possiede almeno un servizio
   * programmato nell'intervallo.
   */
  getByEmployeeBetween(
    employeeId: number,
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
      `${this.apiUrl}/employee/${employeeId}/between`,
      {
        params
      }
    );
  }
}
