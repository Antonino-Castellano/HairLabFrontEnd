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
  ColorSmartHistoryInsight
} from '../models/color-smart-history-insight';

/**
 * API per leggere il contesto tecnico storico
 * prima di una nuova Smart Formula.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorSmartHistoryInsightService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-smart-history'
    );

  getByCustomerId(
    customerId:
      number
  ): Observable<ColorSmartHistoryInsight> {

    return this.http.get<
      ColorSmartHistoryInsight
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }
}
