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
  ColorFormulaCustomerHistory
} from '../models/color-formula-history';

import {
  ColorFormulaDetail
} from '../models/color-formula-management';

/**
 * API dello storico Color Lab cliente.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorFormulaHistoryService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-formula-history'
    );

  getByCustomerId(
    customerId:
      number
  ): Observable<ColorFormulaCustomerHistory> {

    return this.http.get<
      ColorFormulaCustomerHistory
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  duplicateAsDraft(
    formulaId:
      number
  ): Observable<ColorFormulaDetail> {

    return this.http.post<
      ColorFormulaDetail
    >(
      `${this.apiUrl}/${formulaId}/duplicate`,
      {}
    );
  }
}
