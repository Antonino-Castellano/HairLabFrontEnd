import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HairDye } from '../models/hair-dye';

@Injectable({
  providedIn: 'root'
})
export class HairDyeService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/hair-dye';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<HairDye[]> {

    return this.http.get<HairDye[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<HairDye> {

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


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}