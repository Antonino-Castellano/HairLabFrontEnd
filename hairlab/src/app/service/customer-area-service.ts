import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { hairLabApi } from '../core/config/api.config';
import {
  CustomerArea,
  CustomerBookingSlot,
  CustomerBookingSlotRequest,
  CustomerPortalAppointment,
  CustomerSelfBookingRequest,
} from '../models/customer-area';

@Injectable({
  providedIn: 'root',
})
export class CustomerAreaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('customer-area');

  getMyArea(): Observable<CustomerArea> {
    return this.http.get<CustomerArea>(`${this.apiUrl}/me`);
  }

  findBookingSlots(request: CustomerBookingSlotRequest): Observable<CustomerBookingSlot[]> {
    return this.http.post<CustomerBookingSlot[]>(`${this.apiUrl}/appointments/slots`, request);
  }

  bookAppointment(request: CustomerSelfBookingRequest): Observable<CustomerPortalAppointment> {
    return this.http.post<CustomerPortalAppointment>(`${this.apiUrl}/appointments`, request);
  }

  cancelAppointment(appointmentId: number): Observable<CustomerPortalAppointment> {
    return this.http.delete<CustomerPortalAppointment>(
      `${this.apiUrl}/appointments/${appointmentId}`,
    );
  }
}
