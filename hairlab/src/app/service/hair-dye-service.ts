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
  HairDye
} from '../models/hair-dye';

@Injectable({
  providedIn: 'root'
})
export class HairDyeService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('hair-dye');

  getAll():
    Observable<HairDye[]> {

    return this.http.get<HairDye[]>(
      this.apiUrl
    );
  }

  getActive():
    Observable<HairDye[]> {

    return this.http.get<HairDye[]>(
      `${this.apiUrl}/active`
    );
  }

  getById(
    id: number
  ): Observable<HairDye> {

    return this.http.get<HairDye>(
      `${this.apiUrl}/${id}`
    );
  }

  insert(
    hairDye: HairDye
  ): Observable<HairDye> {

    return this.http.post<HairDye>(
      this.apiUrl,
      hairDye
    );
  }

  update(
    id: number,
    hairDye: HairDye
  ): Observable<HairDye> {

    return this.http.put<HairDye>(
      `${this.apiUrl}/${id}`,
      hairDye
    );
  }

  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  activate(
    id: number
  ): Observable<HairDye> {

    return this.http.patch<HairDye>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }
}
