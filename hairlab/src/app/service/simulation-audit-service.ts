import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { HairSimulationAudit } from '../models/simulation-audit';

@Injectable({ providedIn: 'root' })
export class SimulationAuditService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('simulation-audit');

  getByCustomer(customerId: number): Observable<HairSimulationAudit[]> {
    return this.http.get<HairSimulationAudit[]>(`${this.apiUrl}/customer/${customerId}`);
  }
}
