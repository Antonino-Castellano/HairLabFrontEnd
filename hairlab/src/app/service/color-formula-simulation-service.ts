import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { ColorFormulaSimulation } from '../models/color-formula-simulation';

@Injectable({ providedIn: 'root' })
export class ColorFormulaSimulationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('color-formula-simulation');

  simulate(formulaId: number): Observable<ColorFormulaSimulation> {
    return this.http.get<ColorFormulaSimulation>(`${this.apiUrl}/${formulaId}`);
  }
}
