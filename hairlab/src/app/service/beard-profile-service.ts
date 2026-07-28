import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { hairLabApi } from '../core/config/api.config';
import { BeardProfile } from '../models/beard-profile';

@Injectable({ providedIn: 'root' })
export class BeardProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = hairLabApi('beard-profile');

  getByCustomerId(customerId: number): Observable<BeardProfile> {
    return this.http.get<BeardProfile>(`${this.apiUrl}/customer/${customerId}`);
  }

  insert(profile: BeardProfile): Observable<BeardProfile> {
    return this.http.post<BeardProfile>(this.apiUrl, profile);
  }

  update(id: number, profile: BeardProfile): Observable<BeardProfile> {
    return this.http.put<BeardProfile>(`${this.apiUrl}/${id}`, profile);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
