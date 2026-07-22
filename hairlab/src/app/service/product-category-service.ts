import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductCategory } from '../models/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {

  private readonly apiUrl =
    'http://localhost:8080/hairlab/api/product-category';

  constructor(
    private http: HttpClient
  ) {
  }


  getAll(): Observable<ProductCategory[]> {

    return this.http.get<ProductCategory[]>(
      this.apiUrl
    );
  }


  getById(id: number): Observable<ProductCategory> {

    return this.http.get<ProductCategory>(
      `${this.apiUrl}/${id}`
    );
  }


  insert(
    category: ProductCategory
  ): Observable<ProductCategory> {

    return this.http.post<ProductCategory>(
      this.apiUrl,
      category
    );
  }


  update(
    id: number,
    category: ProductCategory
  ): Observable<ProductCategory> {

    return this.http.put<ProductCategory>(
      `${this.apiUrl}/${id}`,
      category
    );
  }


  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}