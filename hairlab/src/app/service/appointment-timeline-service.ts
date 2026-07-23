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
  AppointmentTimelineItem
} from '../models/appointment-timeline-item';

/**
 * Service dedicato alla Timeline operatori.
 *
 * Una sola chiamata restituisce
 * tutti i servizi della giornata
 * già arricchiti con:
 *
 * - cliente;
 * - operatore;
 * - servizio;
 * - stato.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentTimelineService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'appointment-timeline'
    );

  getDay(
    date:
      string
  ): Observable<AppointmentTimelineItem[]> {

    const params =
      new HttpParams()
        .set(
          'date',
          date
        );

    return this.http.get<
      AppointmentTimelineItem[]
    >(
      `${this.apiUrl}/day`,
      {
        params
      }
    );
  }
}
