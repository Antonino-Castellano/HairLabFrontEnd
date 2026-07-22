import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ColorFormula } from '../models/color-formula';

@Injectable({
  providedIn: 'root'
})
export class ColorFormulaService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/color-formula';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<ColorFormula[]> {

    return this.http.get<ColorFormula[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<ColorFormula> {

    return this.http.get<ColorFormula>(
      `${this.apiUrl}/${id}`
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


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}