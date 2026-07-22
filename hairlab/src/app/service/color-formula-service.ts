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
  ColorFormula
} from '../models/color-formula';

@Injectable({
  providedIn: 'root'
})
export class ColorFormulaService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('color-formula');

  getAll():
    Observable<ColorFormula[]> {

    return this.http.get<ColorFormula[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<ColorFormula> {

    return this.http.get<ColorFormula>(
      `${this.apiUrl}/${id}`
    );
  }

  getByConsultationId(
    consultationId: number
  ): Observable<ColorFormula[]> {

    return this.http.get<ColorFormula[]>(
      `${this.apiUrl}/consultation/${consultationId}`
    );
  }

  insert(
    formula: ColorFormula
  ): Observable<ColorFormula> {

    return this.http.post<ColorFormula>(
      this.apiUrl,
      formula
    );
  }

  update(
    id: number,
    formula: ColorFormula
  ): Observable<ColorFormula> {

    return this.http.put<ColorFormula>(
      `${this.apiUrl}/${id}`,
      formula
    );
  }

  /**
   * Il backend archivia la formula
   * invece di distruggerla fisicamente.
   */
  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
