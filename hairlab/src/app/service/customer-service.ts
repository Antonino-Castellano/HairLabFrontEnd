import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/customer';

  /**
   * Recupera tutti i clienti.
   */
  getAll(): Observable<Customer[]> {

    return this.http.get<Customer[]>(
      this.apiUrl
    );
  }

  /**
   * Recupera un cliente tramite ID.
   */
  getById(id: number): Observable<Customer> {

    return this.http.get<Customer>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Inserisce un nuovo cliente.
   */
  insert(customer: Customer): Observable<Customer> {

    return this.http.post<Customer>(
      this.apiUrl,
      customer
    );
  }

  /**
   * Modifica un cliente esistente.
   */
  update(
    id: number,
    customer: Customer
  ): Observable<Customer> {

    return this.http.put<Customer>(
      `${this.apiUrl}/${id}`,
      customer
    );
  }

  /**
   * Elimina un cliente.
   */
  delete(id: number): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}