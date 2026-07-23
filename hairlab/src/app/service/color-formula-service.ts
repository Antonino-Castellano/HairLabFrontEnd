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



  /**
   * Storico formule diretto della cliente.
   */
  getByCustomerId(
    customerId:
      number
  ): Observable<ColorFormula[]> {

    return this.http.get<
      ColorFormula[]
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  /**
   * Ultima formula effettivamente utilizzata.
   */
  getLatestUsedByCustomerId(
    customerId:
      number
  ): Observable<ColorFormula> {

    return this.http.get<
      ColorFormula
    >(
      `${this.apiUrl}/customer/${customerId}/latest-used`
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
   * Elimina la formula tramite l'endpoint backend corrente.
   *
   * La strategia definitiva di archiviazione dello storico
   * verrà raffinata nel blocco dedicato alle Formule salvate.
   */
  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
