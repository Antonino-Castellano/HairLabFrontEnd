import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HairProfile } from '../models/hairProfile';

@Injectable({
  providedIn: 'root'
})
export class HairProfileService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/hair-profile';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<HairProfile[]> {

    return this.http.get<HairProfile[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<HairProfile> {

    return this.http.get<HairProfile>(
      `${this.apiUrl}/${id}`
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


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}