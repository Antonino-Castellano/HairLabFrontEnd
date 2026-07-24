import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { hairLabApi } from '../core/config/api.config';
import { ColorProductLineProfile } from '../models/color-product-line-profile';

@Injectable({
  providedIn: 'root'
})
export class ColorProductLineProfileService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('color-product-line-profile');

  getAll(): Observable<ColorProductLineProfile[]> {
    return this.http.get<ColorProductLineProfile[]>(
      this.apiUrl
    );
  }

  getActive(): Observable<ColorProductLineProfile[]> {
    return this.http.get<ColorProductLineProfile[]>(
      `${this.apiUrl}/active`
    );
  }

  getById(
    id: number
  ): Observable<ColorProductLineProfile> {

    return this.http.get<ColorProductLineProfile>(
      `${this.apiUrl}/${id}`
    );
  }

  insert(
    profile: ColorProductLineProfile
  ): Observable<ColorProductLineProfile> {

    return this.http.post<ColorProductLineProfile>(
      this.apiUrl,
      profile
    );
  }

  update(
    id: number,
    profile: ColorProductLineProfile
  ): Observable<ColorProductLineProfile> {

    return this.http.put<ColorProductLineProfile>(
      `${this.apiUrl}/${id}`,
      profile
    );
  }

  deactivate(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  activate(
    id: number
  ): Observable<ColorProductLineProfile> {

    return this.http.put<ColorProductLineProfile>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }
}
