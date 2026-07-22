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
  CustomerAnalysis
} from '../models/customer-analysis';

/**
 * Service aggregatore della scheda cliente.
 *
 * Nome corretto:
 *
 * customer-analysis-service.ts
 *
 * Eliminare il vecchio file:
 *
 * costumer-analysis-service.ts
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerAnalysisService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('customer-analysis');

  getByCustomerId(
    customerId: number
  ): Observable<CustomerAnalysis> {

    return this.http.get<CustomerAnalysis>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }
}
