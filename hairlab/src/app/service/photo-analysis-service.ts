import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import {
  CreateCustomerPhotoAnalysisRequest,
  CustomerPhotoAnalysis,
  CustomerPhotoAnalysisAudit,
  PhotoAnalysisProviderAvailability,
  ReviewCustomerPhotoAnalysisRequest,
} from '../models/photo-analysis';

@Injectable({ providedIn: 'root' })
export class PhotoAnalysisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('photo-analysis');

  providers(): Observable<PhotoAnalysisProviderAvailability[]> {
    return this.http.get<PhotoAnalysisProviderAvailability[]>(`${this.apiUrl}/providers`);
  }

  findByCustomer(customerId: number): Observable<CustomerPhotoAnalysis[]> {
    return this.http.get<CustomerPhotoAnalysis[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  create(
    customerId: number,
    request: CreateCustomerPhotoAnalysisRequest,
  ): Observable<CustomerPhotoAnalysis> {
    return this.http.post<CustomerPhotoAnalysis>(`${this.apiUrl}/customer/${customerId}`, request);
  }

  review(
    analysisId: number,
    request: ReviewCustomerPhotoAnalysisRequest,
  ): Observable<CustomerPhotoAnalysis> {
    return this.http.put<CustomerPhotoAnalysis>(`${this.apiUrl}/${analysisId}/review`, request);
  }

  reject(analysisId: number): Observable<CustomerPhotoAnalysis> {
    return this.http.post<CustomerPhotoAnalysis>(`${this.apiUrl}/${analysisId}/reject`, {});
  }

  auditByCustomer(customerId: number): Observable<CustomerPhotoAnalysisAudit[]> {
    return this.http.get<CustomerPhotoAnalysisAudit[]>(
      `${this.apiUrl}/audit/customer/${customerId}`,
    );
  }
}
