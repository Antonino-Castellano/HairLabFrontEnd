import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { Consultation } from '../models/consultation';

/**
 * Service Angular dedicato alle consulenze.
 *
 * Questo file sostituisce definitivamente
 * la vecchia copia errata del CustomerService.
 */
@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('consultation');

  getAll(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.apiUrl);
  }

  getById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.apiUrl}/${id}`);
  }

  getByCustomerId(customerId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  insert(consultation: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(this.apiUrl, consultation);
  }

  update(id: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.apiUrl}/${id}`, consultation);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}