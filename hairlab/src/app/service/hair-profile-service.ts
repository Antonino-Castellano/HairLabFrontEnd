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
  HairProfile
} from '../models/hair-profile';

@Injectable({
  providedIn: 'root'
})
export class HairProfileService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('hair-profile');

  getAll():
    Observable<HairProfile[]> {

    return this.http.get<HairProfile[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<HairProfile> {

    return this.http.get<HairProfile>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Miglioria importante.
   *
   * Prima il frontend faceva:
   *
   * GET di TUTTI i profili
   * ->
   * find(profile.customerId === customerId)
   *
   * Ora usa direttamente l'endpoint backend:
   *
   * GET /hair-profile/customer/{customerId}
   */
  getByCustomerId(
    customerId: number
  ): Observable<HairProfile> {

    return this.http.get<HairProfile>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  insert(
    hairProfile: HairProfile
  ): Observable<HairProfile> {

    return this.http.post<HairProfile>(
      this.apiUrl,
      hairProfile
    );
  }

  update(
    id: number,
    hairProfile: HairProfile
  ): Observable<HairProfile> {

    return this.http.put<HairProfile>(
      `${this.apiUrl}/${id}`,
      hairProfile
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
