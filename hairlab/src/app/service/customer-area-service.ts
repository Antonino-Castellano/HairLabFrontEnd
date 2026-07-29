import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { hairLabApi } from "../core/config/api.config";
import {
  CustomerAiConsent,
  GrantAiConsentRequest,
  RevokeAiConsentRequest,
} from "../models/ai-consent";
import {
  CustomerArea,
  CustomerBookingSlot,
  CustomerBookingSlotRequest,
  CustomerPortalAppointment,
  CustomerSelfBookingRequest,
} from "../models/customer-area";
import { CustomerPhoto, CustomerPhotoType } from "../models/customer-photo";

@Injectable({
  providedIn: "root",
})
export class CustomerAreaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi("customer-area");

  getMyArea(): Observable<CustomerArea> {
    return this.http.get<CustomerArea>(`${this.apiUrl}/me`);
  }

  findBookingSlots(
    request: CustomerBookingSlotRequest,
  ): Observable<CustomerBookingSlot[]> {
    return this.http.post<CustomerBookingSlot[]>(
      `${this.apiUrl}/appointments/slots`,
      request,
    );
  }

  bookAppointment(
    request: CustomerSelfBookingRequest,
  ): Observable<CustomerPortalAppointment> {
    return this.http.post<CustomerPortalAppointment>(
      `${this.apiUrl}/appointments`,
      request,
    );
  }

  cancelAppointment(
    appointmentId: number,
  ): Observable<CustomerPortalAppointment> {
    return this.http.delete<CustomerPortalAppointment>(
      `${this.apiUrl}/appointments/${appointmentId}`,
    );
  }

  getMyPhotos(): Observable<CustomerPhoto[]> {
    return this.http.get<CustomerPhoto[]>(`${this.apiUrl}/photos`);
  }

  uploadMyPhoto(
    file: File,
    photoType: CustomerPhotoType,
    description?: string,
  ): Observable<CustomerPhoto> {
    const form = new FormData();
    form.append("file", file);
    form.append("photoType", photoType);

    if (description?.trim()) {
      form.append("description", description.trim());
    }

    return this.http.post<CustomerPhoto>(`${this.apiUrl}/photos`, form);
  }

  selectMyPrimaryPhoto(photoId: number): Observable<CustomerPhoto> {
    return this.http.patch<CustomerPhoto>(
      `${this.apiUrl}/photos/${photoId}/primary`,
      {},
    );
  }

  selectMySimulationSource(photoId: number): Observable<CustomerPhoto> {
    return this.http.patch<CustomerPhoto>(
      `${this.apiUrl}/photos/${photoId}/simulation-source`,
      {},
    );
  }

  removeMyPhoto(photoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/photos/${photoId}`,
    );
  }

  getMyConsent(): Observable<CustomerAiConsent> {
    return this.http.get<CustomerAiConsent>(`${this.apiUrl}/consent`);
  }

  grantMyConsent(
    request: GrantAiConsentRequest,
  ): Observable<CustomerAiConsent> {
    return this.http.post<CustomerAiConsent>(
      `${this.apiUrl}/consent/grant`,
      request,
    );
  }

  revokeMyConsent(
    request: RevokeAiConsentRequest,
  ): Observable<CustomerAiConsent> {
    return this.http.post<CustomerAiConsent>(
      `${this.apiUrl}/consent/revoke`,
      request,
    );
  }
}
