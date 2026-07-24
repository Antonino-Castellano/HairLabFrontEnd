import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { AppointmentColorFormulaLink } from '../models/appointment-color-formula';
import { ColorFormulaDetail } from '../models/color-formula-management';

@Injectable({ providedIn: 'root' })
export class AppointmentColorFormulaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('appointment-color-formulas');

  getByAppointment(appointmentId: number): Observable<AppointmentColorFormulaLink[]> {
    return this.http.get<AppointmentColorFormulaLink[]>(
      `${this.apiUrl}/appointment/${appointmentId}`
    );
  }

  repeatReferenceForItem(appointmentItemId: number): Observable<ColorFormulaDetail> {
    return this.http.post<ColorFormulaDetail>(
      `${this.apiUrl}/item/${appointmentItemId}/repeat-reference`,
      {}
    );
  }
}
