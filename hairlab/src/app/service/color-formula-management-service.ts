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
  ColorFormulaDetail,
  ColorFormulaManagementRequest
} from '../models/color-formula-management';

/**
 * API aggregata del Formula Builder.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorFormulaManagementService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-formula-management'
    );

  getById(
    id:
      number
  ): Observable<ColorFormulaDetail> {

    return this.http.get<
      ColorFormulaDetail
    >(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request:
      ColorFormulaManagementRequest
  ): Observable<ColorFormulaDetail> {

    return this.http.post<
      ColorFormulaDetail
    >(
      this.apiUrl,
      request
    );
  }

  update(
    id:
      number,
    request:
      ColorFormulaManagementRequest
  ): Observable<ColorFormulaDetail> {

    return this.http.put<
      ColorFormulaDetail
    >(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  delete(
    id:
      number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
