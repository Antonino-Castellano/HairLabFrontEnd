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
  ColorFormulaItem
} from '../models/color-formula-item';

@Injectable({
  providedIn: 'root'
})
export class ColorFormulaItemService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('color-formula-item');

  getAll():
    Observable<ColorFormulaItem[]> {

    return this.http.get<ColorFormulaItem[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<ColorFormulaItem> {

    return this.http.get<ColorFormulaItem>(
      `${this.apiUrl}/${id}`
    );
  }

  getByFormulaId(
    colorFormulaId: number
  ): Observable<ColorFormulaItem[]> {

    return this.http.get<ColorFormulaItem[]>(
      `${this.apiUrl}/formula/${colorFormulaId}`
    );
  }

  insert(
    item: ColorFormulaItem
  ): Observable<ColorFormulaItem> {

    return this.http.post<ColorFormulaItem>(
      this.apiUrl,
      item
    );
  }

  update(
    id: number,
    item: ColorFormulaItem
  ): Observable<ColorFormulaItem> {

    return this.http.put<ColorFormulaItem>(
      `${this.apiUrl}/${id}`,
      item
    );
  }

  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
