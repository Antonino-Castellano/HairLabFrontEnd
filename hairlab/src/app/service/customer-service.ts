import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/customer';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<Customer[]> {

    return this.http.get<Customer[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<Customer> {

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


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}