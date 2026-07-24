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
  HairDyeInventoryMovement,
  HairDyeInventoryMovementRequest
} from '../models/hair-dye-inventory-movement';

@Injectable({
  providedIn: 'root'
})
export class HairDyeInventoryMovementService {

  private readonly http =
    inject(
      HttpClient
    );

  private readonly apiUrl =
    hairLabApi(
      'hair-dye-inventory-movement'
    );

  getAll():
    Observable<HairDyeInventoryMovement[]> {

    return this.http.get<
      HairDyeInventoryMovement[]
    >(
      this.apiUrl
    );
  }

  getByInventoryId(
    inventoryId:
      number
  ): Observable<HairDyeInventoryMovement[]> {

    return this.http.get<
      HairDyeInventoryMovement[]
    >(
      `${this.apiUrl}/inventory/${inventoryId}`
    );
  }

  getByHairDyeId(
    hairDyeId:
      number
  ): Observable<HairDyeInventoryMovement[]> {

    return this.http.get<
      HairDyeInventoryMovement[]
    >(
      `${this.apiUrl}/hair-dye/${hairDyeId}`
    );
  }

  create(
    inventoryId:
      number,
    request:
      HairDyeInventoryMovementRequest
  ): Observable<HairDyeInventoryMovement> {

    return this.http.post<
      HairDyeInventoryMovement
    >(
      `${this.apiUrl}/inventory/${inventoryId}`,
      request
    );
  }
}
