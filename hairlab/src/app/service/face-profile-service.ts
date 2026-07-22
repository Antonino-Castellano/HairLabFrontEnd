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
  FaceProfile
} from '../models/face-profile';

@Injectable({
  providedIn: 'root'
})
export class FaceProfileService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('face-profile');

  getAll():
    Observable<FaceProfile[]> {

    return this.http.get<FaceProfile[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<FaceProfile> {

    return this.http.get<FaceProfile>(
      `${this.apiUrl}/${id}`
    );
  }

  getByCustomerId(
    customerId: number
  ): Observable<FaceProfile> {

    return this.http.get<FaceProfile>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  insert(
    profile: FaceProfile
  ): Observable<FaceProfile> {

    return this.http.post<FaceProfile>(
      this.apiUrl,
      profile
    );
  }

  update(
    id: number,
    profile: FaceProfile
  ): Observable<FaceProfile> {

    return this.http.put<FaceProfile>(
      `${this.apiUrl}/${id}`,
      profile
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
