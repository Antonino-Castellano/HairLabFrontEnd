import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { AnalyticsPreset, BusinessAnalyticsDashboard } from '../models/business-analytics';

@Injectable({ providedIn: 'root' })
export class BusinessAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('business-analytics');

  getDashboard(
    start: string,
    end: string,
    preset: AnalyticsPreset,
  ): Observable<BusinessAnalyticsDashboard> {
    const params = new HttpParams().set('start', start).set('end', end).set('preset', preset);
    return this.http.get<BusinessAnalyticsDashboard>(this.apiUrl, { params });
  }
}
