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
  FaceProfile
} from '../models/face-profile';

/**
 * Service Angular dedicato
 * alle API FaceProfile.
 */
@Injectable({
  providedIn: 'root'
})
export class FaceProfileService {

  private readonly http =
    inject(HttpClient);

  /**
   * Endpoint backend.
   */
  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/face-profile';

  /**
   * Recupera tutti i profili.
   */
  getAll():
    Observable<FaceProfile[]> {

    return this.http.get<
      FaceProfile[]
    >(
      this.apiUrl
    );
  }

  /**
   * Recupera un profilo tramite ID.
   */
  getById(
    id: number
  ): Observable<FaceProfile> {

    return this.http.get<
      FaceProfile
    >(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Recupera il profilo
   * associato a una cliente.
   */
  getByCustomerId(
    customerId: number
  ): Observable<FaceProfile> {

    return this.http.get<
      FaceProfile
    >(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  /**
   * Crea un nuovo profilo.
   */
  insert(
    faceProfile: FaceProfile
  ): Observable<FaceProfile> {

    return this.http.post<
      FaceProfile
    >(
      this.apiUrl,
      faceProfile
    );
  }

  /**
   * Modifica un profilo.
   */
  update(
    id: number,
    faceProfile: FaceProfile
  ): Observable<FaceProfile> {

    return this.http.put<
      FaceProfile
    >(
      `${this.apiUrl}/${id}`,
      faceProfile
    );
  }

  /**
   * Elimina un profilo.
   */
  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}