import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { hairLabApi } from '../core/config/api.config';
import {
  ColorFormulaUsage,
  ColorFormulaUseRequest
} from '../models/color-formula-usage';

@Injectable({
  providedIn: 'root'
})
export class ColorFormulaUsageService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('color-formula-usage');

  getByFormulaId(
    formulaId: number
  ): Observable<ColorFormulaUsage> {

    return this.http.get<ColorFormulaUsage>(
      `${this.apiUrl}/formula/${formulaId}`
    );
  }

  useFormula(
    formulaId: number,
    request: ColorFormulaUseRequest
  ): Observable<ColorFormulaUsage> {

    return this.http.post<ColorFormulaUsage>(
      `${this.apiUrl}/formula/${formulaId}/use`,
      request
    );
  }
}
