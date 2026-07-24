import {
  InventoryUnit
} from './enums/inventory-unit';

import {
  ProductType
} from './enums/product-type';

export type HairDyeInventoryMovementType =
  | 'INITIAL_STOCK'
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'FORMULA_USAGE'
  | 'RETURN_IN'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'INVENTORY_COUNT'
  | 'ADJUSTMENT';

export interface HairDyeInventoryMovementRequest {

  movementType: HairDyeInventoryMovementType;

  quantity: number;

  referenceCode?: string | null;

  reason?: string | null;
}

export interface HairDyeInventoryMovement {

  id: number;

  inventoryId: number;

  hairDyeId: number;

  brand: string;

  lineName?: string | null;

  code: string;

  name: string;

  productType: ProductType;

  formulaUsageId?: number | null;

  formulaId?: number | null;

  movementType: HairDyeInventoryMovementType;

  quantity: number;

  signedDelta: number;

  unit: InventoryUnit;

  quantityBefore: number;

  quantityAfter: number;

  actorEmail?: string | null;

  referenceCode?: string | null;

  reason?: string | null;

  createdAt: string;
}
