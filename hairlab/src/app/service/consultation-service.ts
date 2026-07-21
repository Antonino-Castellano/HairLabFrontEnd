import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Consultation } from '../models/consultation';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/consultation';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<Consultation[]> {

    return this.http.get<Consultation[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<Consultation> {

    return this.http.get<Consultation>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    consultation: Consultation
  ): Observable<Consultation> {

    return this.http.post<Consultation>(
      this.apiUrl,
      consultation
    );
  }


  update(
    id: number,
    consultation: Consultation
  ): Observable<Consultation> {

    return this.http.put<Consultation>(
      `${this.apiUrl}/${id}`,
      consultation
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}