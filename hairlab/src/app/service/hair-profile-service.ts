import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HairProfile } from '../models/hair-profile';

@Injectable({
  providedIn: 'root'
})
export class HairProfileService {
  /**
   * HttpClient permette al service di comunicare
   * con il backend Spring Boot.
   */
  private readonly http = inject(HttpClient);

  /**
   * URL base del controller HairProfile.
   */
  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/hair-profile';

  /**
   * Recupera tutti i profili capelli.
   */
  getAll(): Observable<HairProfile[]> {
    return this.http.get<HairProfile[]>(
      this.apiUrl
    );
  }

  /**
   * Recupera un profilo tramite il suo ID.
   */
  getById(id: number): Observable<HairProfile> {
    return this.http.get<HairProfile>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Recupera il profilo appartenente a uno specifico cliente.
   *
   * Per ora utilizziamo getAll() e cerchiamo il profilo
   * tramite customerId.
   *
   * Più avanti potremo creare un endpoint backend dedicato,
   * evitando di scaricare tutti i profili.
   */
  getByCustomerId(
    customerId: number
  ): Observable<HairProfile | null> {
    return this.getAll().pipe(
      map(profiles =>
        profiles.find(
          profile => profile.customerId === customerId
        ) ?? null
      )
    );
  }

  /**
   * Crea un nuovo profilo capelli.
   */
  insert(
    hairProfile: HairProfile
  ): Observable<HairProfile> {
    return this.http.post<HairProfile>(
      this.apiUrl,
      hairProfile
    );
  }

  /**
   * Modifica un profilo esistente.
   */
  update(
    id: number,
    hairProfile: HairProfile
  ): Observable<HairProfile> {
    return this.http.put<HairProfile>(
      `${this.apiUrl}/${id}`,
      hairProfile
    );
  }

  /**
   * Elimina un profilo.
   *
   * Usiamo unknown perché il backend potrebbe
   * restituire un messaggio JSON invece di un body vuoto.
   */
  delete(id: number): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}