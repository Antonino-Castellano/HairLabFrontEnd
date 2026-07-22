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
  ProductCategory
} from '../models/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    hairLabApi('product-category');

  getAll():
    Observable<ProductCategory[]> {

    return this.http.get<ProductCategory[]>(
      this.apiUrl
    );
  }

  getActive():
    Observable<ProductCategory[]> {

    return this.http.get<ProductCategory[]>(
      `${this.apiUrl}/active`
    );
  }

  getById(
    id: number
  ): Observable<ProductCategory> {

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

  delete(
    id: number
  ): Observable<unknown> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  activate(
    id: number
  ): Observable<ProductCategory> {

    return this.http.patch<ProductCategory>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }
}
