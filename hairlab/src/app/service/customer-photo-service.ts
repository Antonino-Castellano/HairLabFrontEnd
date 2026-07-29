import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { CustomerPhoto, CustomerPhotoSource, CustomerPhotoType } from '../models/customer-photo';

@Injectable({ providedIn: 'root' })
export class CustomerPhotoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('customer-photos');

  getByCustomer(customerId: number): Observable<CustomerPhoto[]> {
    return this.http.get<CustomerPhoto[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  resolveSource(customerId: number): Observable<CustomerPhoto | null> {
    return this.http.get<CustomerPhoto | null>(`${this.apiUrl}/customer/${customerId}/source`);
  }

  upload(
    customerId: number,
    file: File,
    photoType: CustomerPhotoType,
    source: CustomerPhotoSource,
    description?: string,
  ): Observable<CustomerPhoto> {
    const form = new FormData();
    form.append('file', file);
    form.append('photoType', photoType);
    form.append('source', source);
    if (description?.trim()) form.append('description', description.trim());
    return this.http.post<CustomerPhoto>(`${this.apiUrl}/customer/${customerId}`, form);
  }

  selectSimulationSource(photoId: number): Observable<CustomerPhoto> {
    return this.http.patch<CustomerPhoto>(`${this.apiUrl}/${photoId}/simulation-source`, {});
  }

  selectPrimary(photoId: number): Observable<CustomerPhoto> {
    return this.http.patch<CustomerPhoto>(`${this.apiUrl}/${photoId}/primary`, {});
  }

  deactivate(photoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${photoId}`);
  }
}
