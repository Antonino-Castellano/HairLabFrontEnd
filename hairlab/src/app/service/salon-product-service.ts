import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { SalonProduct } from '../models/salon-product';

@Injectable({
  providedIn: 'root'
})
export class SalonProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('salon-product');

  getAll(): Observable<SalonProduct[]> {
    return this.http.get<SalonProduct[]>(this.apiUrl);
  }

  getActive(): Observable<SalonProduct[]> {
    return this.http.get<SalonProduct[]>(`${this.apiUrl}/active`);
  }

  getByCategoryId(categoryId: number): Observable<SalonProduct[]> {
    return this.http.get<SalonProduct[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getById(id: number): Observable<SalonProduct> {
    return this.http.get<SalonProduct>(`${this.apiUrl}/${id}`);
  }

  insert(product: SalonProduct): Observable<SalonProduct> {
    return this.http.post<SalonProduct>(this.apiUrl, product);
  }

  update(id: number, product: SalonProduct): Observable<SalonProduct> {
    return this.http.put<SalonProduct>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

  deactivate(id: number): Observable<SalonProduct> {
    return this.http.patch<SalonProduct>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  activate(id: number): Observable<SalonProduct> {
    return this.http.patch<SalonProduct>(`${this.apiUrl}/${id}/activate`, {});
  }
}