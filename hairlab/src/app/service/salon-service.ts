import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Salon } from '../models/salon';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  
  // Endpoint allineato al RestController del backend
  private apiUrl = 'http://localhost:8080/hairlab/api/salons';

  constructor(private http: HttpClient) {}

  registerSalon(salon: Salon): Observable<Salon> {
    return this.http.post<Salon>(this.apiUrl, salon);
  }

  findAll(): Observable<Salon[]> {
    return this.http.get<Salon[]>(this.apiUrl);
  }
}