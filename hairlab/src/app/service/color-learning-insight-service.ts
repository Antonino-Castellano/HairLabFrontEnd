import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { ColorLearningInsight } from '../models/color-learning-insight';

@Injectable({ providedIn: 'root' })
export class ColorLearningInsightService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('color-learning');

  getByCustomerId(customerId: number): Observable<ColorLearningInsight> {
    return this.http.get<ColorLearningInsight>(`${this.apiUrl}/customer/${customerId}`);
  }
}
