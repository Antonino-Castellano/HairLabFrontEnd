import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ColorFormulaItem } from '../models/color-formula-item';

@Injectable({
  providedIn: 'root'
})
export class ColorFormulaItemService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/color-formula-item';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<ColorFormulaItem[]> {

    return this.http.get<ColorFormulaItem[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<ColorFormulaItem> {

    return this.http.get<ColorFormulaItem>(
      `${this.apiUrl}/${id}`
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


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}