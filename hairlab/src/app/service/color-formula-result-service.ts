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
  ColorFormulaResult,
  ColorFormulaResultRequest
} from '../models/color-formula-result';

/**
 * API del risultato tecnico post-servizio.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorFormulaResultService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-formula-result'
    );

  getByFormulaId(
    formulaId:
      number
  ): Observable<ColorFormulaResult> {

    return this.http.get<
      ColorFormulaResult
    >(
      `${this.apiUrl}/formula/${formulaId}`
    );
  }

  save(
    formulaId:
      number,
    request:
      ColorFormulaResultRequest
  ): Observable<ColorFormulaResult> {

    return this.http.put<
      ColorFormulaResult
    >(
      `${this.apiUrl}/formula/${formulaId}`,
      request
    );
  }
}
