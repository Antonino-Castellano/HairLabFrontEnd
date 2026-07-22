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
  StyleRecommendation
} from '../models/style-recommendation';

/**
 * Service del motore suggerimenti HairLab.
 *
 * Non esegue insert/update/delete perché
 * le raccomandazioni vengono calcolate
 * dinamicamente dal backend.
 */
@Injectable({
  providedIn: 'root'
})
export class StyleRecommendationService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/style-recommendation';

  /**
   * Genera/recupera i suggerimenti
   * aggiornati per una cliente.
   */
  getByCustomerId(
    customerId: number
  ): Observable<StyleRecommendation> {

    return this.http.get<
      StyleRecommendation
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }
}