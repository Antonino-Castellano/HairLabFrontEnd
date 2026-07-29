import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { AiBudgetSummary, ProviderPreference, SimulationProvider } from '../models/hair-simulation';

@Injectable({ providedIn: 'root' })
export class SimulationSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('simulation-settings');

  getPreference(): Observable<ProviderPreference> {
    return this.http.get<ProviderPreference>(`${this.apiUrl}/preference`);
  }

  updatePreference(preferredProvider: SimulationProvider | null): Observable<ProviderPreference> {
    return this.http.put<ProviderPreference>(`${this.apiUrl}/preference`, {
      preferredProvider,
    });
  }

  getBudget(): Observable<AiBudgetSummary> {
    return this.http.get<AiBudgetSummary>(`${this.apiUrl}/budget`);
  }
}
