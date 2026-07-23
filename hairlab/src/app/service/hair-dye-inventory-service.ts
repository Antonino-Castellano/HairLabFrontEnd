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
  HairDyeInventory
} from '../models/hair-dye-inventory';

/**
 * API client del magazzino Color Lab.
 */
@Injectable({
  providedIn: 'root'
})
export class HairDyeInventoryService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'hair-dye-inventory'
    );

  getAll():
    Observable<HairDyeInventory[]> {

    return this.http.get<
      HairDyeInventory[]
    >(
      this.apiUrl
    );
  }

  getById(
    id:
      number
  ): Observable<HairDyeInventory> {

    return this.http.get<
      HairDyeInventory
    >(
      `${this.apiUrl}/${id}`
    );
  }

  getByHairDyeId(
    hairDyeId:
      number
  ): Observable<HairDyeInventory> {

    return this.http.get<
      HairDyeInventory
    >(
      `${this.apiUrl}/hair-dye/${hairDyeId}`
    );
  }

  insert(
    inventory:
      HairDyeInventory
  ): Observable<HairDyeInventory> {

    return this.http.post<
      HairDyeInventory
    >(
      this.apiUrl,
      inventory
    );
  }

  update(
    id:
      number,
    inventory:
      HairDyeInventory
  ): Observable<HairDyeInventory> {

    return this.http.put<
      HairDyeInventory
    >(
      `${this.apiUrl}/${id}`,
      inventory
    );
  }
}
