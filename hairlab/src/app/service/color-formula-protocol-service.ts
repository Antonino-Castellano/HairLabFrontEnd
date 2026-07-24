import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { hairLabApi } from '../core/config/api.config';
import {
  ColorFormulaCompatibilityReport,
  ColorFormulaProtocol,
  ColorFormulaProtocolRequest
} from '../models/color-formula-protocol';

@Injectable({ providedIn: 'root' })
export class ColorFormulaProtocolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('color-formula-protocol');

  getByFormulaId(formulaId: number): Observable<ColorFormulaProtocol> {
    return this.http.get<ColorFormulaProtocol>(
      `${this.apiUrl}/formula/${formulaId}`
    );
  }

  save(
    formulaId: number,
    request: ColorFormulaProtocolRequest
  ): Observable<ColorFormulaProtocol> {
    return this.http.put<ColorFormulaProtocol>(
      `${this.apiUrl}/formula/${formulaId}`,
      request
    );
  }

  validate(formulaId: number): Observable<ColorFormulaCompatibilityReport> {
    return this.http.get<ColorFormulaCompatibilityReport>(
      `${this.apiUrl}/formula/${formulaId}/validate`
    );
  }
}
