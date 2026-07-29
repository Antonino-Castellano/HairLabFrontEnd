import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { hairLabApi } from '../core/config/api.config';
import {
  ColorSupplierOrder,
  ColorSupplierOrderFromReorderRequest,
  ColorSupplierOrderReceiveRequest,
} from '../models/color-supplier-order';

@Injectable({ providedIn: 'root' })
export class ColorSupplierOrderService {
  private readonly http = inject(HttpClient);
  private readonly url = hairLabApi('color-supplier-order');

  getAll() {
    return this.http.get<ColorSupplierOrder[]>(this.url);
  }

  getById(id: number) {
    return this.http.get<ColorSupplierOrder>(`${this.url}/${id}`);
  }

  createFromReorder(supplierId: number, request: ColorSupplierOrderFromReorderRequest) {
    return this.http.post<ColorSupplierOrder>(`${this.url}/from-reorder/${supplierId}`, request);
  }

  updateUnitPrice(orderId: number, itemId: number, unitPrice: number) {
    return this.http.put<ColorSupplierOrder>(`${this.url}/${orderId}/items/${itemId}/unit-price`, {
      unitPrice,
    });
  }

  markOrdered(id: number) {
    return this.http.put<ColorSupplierOrder>(`${this.url}/${id}/mark-ordered`, {});
  }

  cancel(id: number) {
    return this.http.put<ColorSupplierOrder>(`${this.url}/${id}/cancel`, {});
  }

  receive(id: number, request: ColorSupplierOrderReceiveRequest) {
    return this.http.post<ColorSupplierOrder>(`${this.url}/${id}/receive`, request);
  }
}
