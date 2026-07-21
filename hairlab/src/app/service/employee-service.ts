import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/employee';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<Employee[]> {

    return this.http.get<Employee[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<Employee> {

    return this.http.get<Employee>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    employee: Employee
  ): Observable<Employee> {

    return this.http.post<Employee>(
      this.apiUrl,
      employee
    );
  }


  update(
    id: number,
    employee: Employee
  ): Observable<Employee> {

    return this.http.put<Employee>(
      `${this.apiUrl}/${id}`,
      employee
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}