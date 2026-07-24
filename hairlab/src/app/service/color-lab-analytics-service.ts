import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { ColorLabAnalytics } from '../models/color-lab-analytics';

@Injectable({ providedIn: 'root' })
export class ColorLabAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('color-lab-analytics');

  getSummary(): Observable<ColorLabAnalytics> {
    return this.http.get<ColorLabAnalytics>(this.apiUrl);
  }
}
