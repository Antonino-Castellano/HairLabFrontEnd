import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import {
  BeardCatalogFilters,
  BeardStyleDefinitionCatalog,
  CatalogTab,
  FringeCatalogFilters,
  FringeDefinitionCatalog,
  HaircutCatalogFilters,
  HaircutDefinitionCatalog,
  StyleCatalogItem,
  StyleCatalogSummary,
} from '../models/style-catalog';

@Injectable({ providedIn: 'root' })
export class StyleCatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('style-catalog');

  getSummary(): Observable<StyleCatalogSummary> {
    return this.http.get<StyleCatalogSummary>(`${this.apiUrl}/summary`);
  }

  getHaircuts(filters: HaircutCatalogFilters): Observable<HaircutDefinitionCatalog[]> {
    return this.http.get<HaircutDefinitionCatalog[]>(`${this.apiUrl}/haircuts`, {
      params: this.params(filters),
    });
  }

  getFringes(filters: FringeCatalogFilters): Observable<FringeDefinitionCatalog[]> {
    return this.http.get<FringeDefinitionCatalog[]>(`${this.apiUrl}/fringes`, {
      params: this.params(filters),
    });
  }

  getBeards(filters: BeardCatalogFilters): Observable<BeardStyleDefinitionCatalog[]> {
    return this.http.get<BeardStyleDefinitionCatalog[]>(`${this.apiUrl}/beards`, {
      params: this.params(filters),
    });
  }

  createHaircut(item: HaircutDefinitionCatalog): Observable<HaircutDefinitionCatalog> {
    return this.http.post<HaircutDefinitionCatalog>(`${this.apiUrl}/haircuts`, item);
  }

  updateHaircut(id: number, item: HaircutDefinitionCatalog): Observable<HaircutDefinitionCatalog> {
    return this.http.put<HaircutDefinitionCatalog>(`${this.apiUrl}/haircuts/${id}`, item);
  }

  deleteHaircut(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/haircuts/${id}`);
  }

  createFringe(item: FringeDefinitionCatalog): Observable<FringeDefinitionCatalog> {
    return this.http.post<FringeDefinitionCatalog>(`${this.apiUrl}/fringes`, item);
  }

  updateFringe(id: number, item: FringeDefinitionCatalog): Observable<FringeDefinitionCatalog> {
    return this.http.put<FringeDefinitionCatalog>(`${this.apiUrl}/fringes/${id}`, item);
  }

  deleteFringe(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/fringes/${id}`);
  }

  createBeard(item: BeardStyleDefinitionCatalog): Observable<BeardStyleDefinitionCatalog> {
    return this.http.post<BeardStyleDefinitionCatalog>(`${this.apiUrl}/beards`, item);
  }

  updateBeard(
    id: number,
    item: BeardStyleDefinitionCatalog,
  ): Observable<BeardStyleDefinitionCatalog> {
    return this.http.put<BeardStyleDefinitionCatalog>(`${this.apiUrl}/beards/${id}`, item);
  }

  deleteBeard(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/beards/${id}`);
  }

  uploadImage(tab: CatalogTab, id: number, file: File): Observable<StyleCatalogItem> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<StyleCatalogItem>(`${this.apiUrl}/${tab}/${id}/image`, body);
  }

  removeImage(tab: CatalogTab, id: number): Observable<StyleCatalogItem> {
    return this.http.delete<StyleCatalogItem>(`${this.apiUrl}/${tab}/${id}/image`);
  }

  private params(values: object): HttpParams {
    let params = new HttpParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
