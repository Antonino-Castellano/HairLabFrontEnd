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
  AppointmentSlotSearchRequest,
  AppointmentSlotSuggestion
} from '../models/appointment-slot-search';

/**
 * Ricerca automatica dei primi
 * orari disponibili per l'intera
 * sequenza dei servizi.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentSlotSearchService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'appointment-slot-search'
    );

  search(
    request:
      AppointmentSlotSearchRequest
  ): Observable<AppointmentSlotSuggestion[]> {

    return this.http.post<
      AppointmentSlotSuggestion[]
    >(
      this.apiUrl,
      request
    );
  }
}
