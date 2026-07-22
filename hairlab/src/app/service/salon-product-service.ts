import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SalonProduct } from '../models/salon-product';

@Injectable({
  providedIn: 'root'
})
export class SalonProductService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/salon-product';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<SalonProduct[]> {

    return this.http.get<SalonProduct[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<SalonProduct> {

    return this.http.get<SalonProduct>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    product: SalonProduct
  ): Observable<SalonProduct> {

    return this.http.post<SalonProduct>(
      this.apiUrl,
      product
    );
  }


  update(
    id: number,
    product: SalonProduct
  ): Observable<SalonProduct> {

    return this.http.put<SalonProduct>(
      `${this.apiUrl}/${id}`,
      product
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}