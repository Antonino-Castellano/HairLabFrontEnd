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
  StyleRecommendation
} from '../models/style-recommendation';

@Injectable({
  providedIn: 'root'
})
export class StyleRecommendationService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('style-recommendation');

  getByCustomerId(
    customerId: number
  ): Observable<StyleRecommendation> {

    return this.http.get<StyleRecommendation>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }
}
