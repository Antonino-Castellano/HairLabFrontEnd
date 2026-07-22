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
  AppointmentDetail,
  AppointmentManagementRequest
} from '../models/appointment-management';

/**
 * Service frontend dedicato
 * alle operazioni atomiche:
 *
 * Appointment + AppointmentItem.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentManagementService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi(
      'appointment-management'
    );

  getById(
    id: number
  ): Observable<AppointmentDetail> {

    return this.http.get<AppointmentDetail>(
      `${this.apiUrl}/${id}`
    );
  }

  insert(
    request: AppointmentManagementRequest
  ): Observable<AppointmentDetail> {

    return this.http.post<AppointmentDetail>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: AppointmentManagementRequest
  ): Observable<AppointmentDetail> {

    return this.http.put<AppointmentDetail>(
      `${this.apiUrl}/${id}`,
      request
    );
  }
}
