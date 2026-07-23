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
  ColorSmartDiagnosis,
  ColorSmartDiagnosisRequest
} from '../models/color-smart-diagnosis';

/**
 * Client HTTP del motore diagnostico Color Lab.
 */
@Injectable({
  providedIn: 'root'
})
export class ColorSmartDiagnosisService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'color-smart-diagnosis'
    );

  analyze(
    request:
      ColorSmartDiagnosisRequest
  ): Observable<ColorSmartDiagnosis> {

    return this.http.post<
      ColorSmartDiagnosis
    >(
      `${this.apiUrl}/analyze`,
      request
    );
  }
}
