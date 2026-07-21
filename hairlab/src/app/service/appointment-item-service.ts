import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppointmentItem } from '../models/appointmentItem';

@Injectable({
  providedIn: 'root'
})
export class AppointmentItemService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/appointment-item';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<AppointmentItem[]> {

    return this.http.get<AppointmentItem[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<AppointmentItem> {

    return this.http.get<AppointmentItem>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    item: AppointmentItem
  ): Observable<AppointmentItem> {

    return this.http.post<AppointmentItem>(
      this.apiUrl,
      item
    );
  }


  update(
    id: number,
    item: AppointmentItem
  ): Observable<AppointmentItem> {

    return this.http.put<AppointmentItem>(
      `${this.apiUrl}/${id}`,
      item
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}