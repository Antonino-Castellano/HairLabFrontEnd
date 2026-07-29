import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import {
  CreateHairSimulationRequest,
  GenerateHairSimulationRequest,
  HairSimulation,
  SimulationGenerationQuote,
  SimulationProviderAvailability,
  SimulationType,
} from '../models/hair-simulation';

@Injectable({ providedIn: 'root' })
export class HairSimulationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('simulations');

  getByCustomer(customerId: number): Observable<HairSimulation[]> {
    return this.http.get<HairSimulation[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getProviders(simulationType?: SimulationType): Observable<SimulationProviderAvailability[]> {
    const params = simulationType
      ? new HttpParams().set('simulationType', simulationType)
      : undefined;
    return this.http.get<SimulationProviderAvailability[]>(`${this.apiUrl}/providers`, { params });
  }

  create(customerId: number, request: CreateHairSimulationRequest): Observable<HairSimulation> {
    return this.http.post<HairSimulation>(`${this.apiUrl}/customer/${customerId}`, request);
  }

  quote(
    simulationId: number,
    request: GenerateHairSimulationRequest,
  ): Observable<SimulationGenerationQuote> {
    return this.http.post<SimulationGenerationQuote>(
      `${this.apiUrl}/${simulationId}/quote`,
      request,
    );
  }

  generate(
    simulationId: number,
    request: GenerateHairSimulationRequest,
  ): Observable<HairSimulation> {
    return this.http.post<HairSimulation>(`${this.apiUrl}/${simulationId}/generate`, request);
  }

  updateSource(simulationId: number, sourcePhotoId?: number | null): Observable<HairSimulation> {
    return this.http.patch<HairSimulation>(`${this.apiUrl}/${simulationId}/source-photo`, {
      sourcePhotoId: sourcePhotoId ?? null,
    });
  }

  cancel(simulationId: number): Observable<HairSimulation> {
    return this.http.patch<HairSimulation>(`${this.apiUrl}/${simulationId}/cancel`, {});
  }

  delete(simulationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${simulationId}`);
  }
}
