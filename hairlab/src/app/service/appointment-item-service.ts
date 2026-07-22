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
  AppointmentItem
} from '../models/appointment-item';

@Injectable({
  providedIn: 'root'
})
export class AppointmentItemService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('appointment-item');

  getAll():
    Observable<AppointmentItem[]> {

    return this.http.get<AppointmentItem[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<AppointmentItem> {

    return this.http.get<AppointmentItem>(
      `${this.apiUrl}/${id}`
    );
  }

  getByAppointmentId(
    appointmentId: number
  ): Observable<AppointmentItem[]> {

    return this.http.get<AppointmentItem[]>(
      `${this.apiUrl}/appointment/${appointmentId}`
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

  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
