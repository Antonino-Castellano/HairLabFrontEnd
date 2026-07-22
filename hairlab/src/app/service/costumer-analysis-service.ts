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
  CustomerAnalysis
} from '../models/customer-analysis';

/**
 * Service dedicato alla scheda
 * tecnica aggregata della cliente.
 *
 * Permette di recuperare con una
 * singola richiesta:
 *
 * - Customer;
 * - HairProfile;
 * - FaceProfile;
 * - ColorAnalysis;
 * - StyleRecommendation.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerAnalysisService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/customer-analysis';

  /**
   * Recupera l'intera scheda tecnica
   * di una cliente.
   */
  getByCustomerId(
    customerId: number
  ): Observable<CustomerAnalysis> {

    return this.http.get<
      CustomerAnalysis
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }
}