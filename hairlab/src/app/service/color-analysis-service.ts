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
  ColorAnalysis
} from '../models/color-analysis';

/**
 * Service Angular dedicato
 * all'analisi cromatica.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorAnalysisService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/color-analysis';

  getAll():
    Observable<ColorAnalysis[]> {

    return this.http.get<
      ColorAnalysis[]
    >(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<ColorAnalysis> {

    return this.http.get<
      ColorAnalysis
    >(
      `${this.apiUrl}/${id}`
    );
  }

  getByCustomerId(
    customerId: number
  ): Observable<ColorAnalysis> {

    return this.http.get<
      ColorAnalysis
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  insert(
    analysis: ColorAnalysis
  ): Observable<ColorAnalysis> {

    return this.http.post<
      ColorAnalysis
    >(
      this.apiUrl,
      analysis
    );
  }

  update(
    id: number,
    analysis: ColorAnalysis
  ): Observable<ColorAnalysis> {

    return this.http.put<
      ColorAnalysis
    >(
      `${this.apiUrl}/${id}`,
      analysis
    );
  }

  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}