import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Appointment } from '../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/appointment';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<Appointment[]> {

    return this.http.get<Appointment[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<Appointment> {

    return this.http.get<Appointment>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http.post<Appointment>(
      this.apiUrl,
      appointment
    );
  }


  update(
    id: number,
    appointment: Appointment
  ): Observable<Appointment> {

    return this.http.put<Appointment>(
      `${this.apiUrl}/${id}`,
      appointment
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}