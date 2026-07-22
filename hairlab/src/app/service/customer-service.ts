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
  Customer
} from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('customer');

  /**
   * Tutti i clienti.
   */
  getAll():
    Observable<Customer[]> {

    return this.http.get<Customer[]>(
      this.apiUrl
    );
  }

  /**
   * Solo clienti attivi.
   */
  getActive():
    Observable<Customer[]> {

    return this.http.get<Customer[]>(
      `${this.apiUrl}/active`
    );
  }

  /**
   * Solo clienti disattivati.
   */
  getInactive():
    Observable<Customer[]> {

    return this.http.get<Customer[]>(
      `${this.apiUrl}/inactive`
    );
  }

  getById(
    id: number
  ): Observable<Customer> {

    return this.http.get<Customer>(
      `${this.apiUrl}/${id}`
    );
  }

  insert(
    customer: Customer
  ): Observable<Customer> {

    return this.http.post<Customer>(
      this.apiUrl,
      customer
    );
  }

  update(
    id: number,
    customer: Customer
  ): Observable<Customer> {

    return this.http.put<Customer>(
      `${this.apiUrl}/${id}`,
      customer
    );
  }

  deactivate(
    id: number
  ): Observable<Customer> {

    return this.http.patch<Customer>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }

  activate(
    id: number
  ): Observable<Customer> {

    return this.http.patch<Customer>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
