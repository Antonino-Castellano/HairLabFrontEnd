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
  ColorSmartDiagnosisRequest
} from '../models/color-smart-diagnosis';

import {
  ColorSmartFormulaResponse
} from '../models/color-smart-formula';

/**
 * Smart Formula - selezione prodotti.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorSmartFormulaService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-smart-formula'
    );

  propose(
    request:
      ColorSmartDiagnosisRequest
  ): Observable<ColorSmartFormulaResponse> {

    return this.http.post<
      ColorSmartFormulaResponse
    >(
      `${this.apiUrl}/propose`,
      request
    );
  }
}
