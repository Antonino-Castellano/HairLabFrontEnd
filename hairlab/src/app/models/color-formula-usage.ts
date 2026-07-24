import { InventoryUnit } from './enums/inventory-unit';
import { Oxygen } from './enums/oxygen';
import { ProductType } from './enums/product-type';

export type HairDyeInventoryMovementType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'FORMULA_USAGE'
  | 'ADJUSTMENT';

export interface ColorFormulaUseRequest {
  developerHairDyeId: number;
  notes?: string;
}

export interface ColorFormulaUsageMovement {
  id: number;
  hairDyeId: number;
  brand: string;
  code: string;
  name: string;
  productType: ProductType;
  movementType: HairDyeInventoryMovementType;
  quantity: number;
  unit: InventoryUnit;
  quantityBefore: number;
  quantityAfter: number;
  createdAt: string;
}

export interface ColorFormulaUsage {
  id: number;
  formulaId: number;
  customerId: number;
  developerHairDyeId: number;
  developerBrand: string;
  developerCode: string;
  developerName: string;
  developerVolume: Oxygen;
  totalColorQuantity: number;
  developerQuantity: number;
  developerUnit: InventoryUnit;
  totalMixtureQuantity: number;
  usedAt: string;
  notes?: string | null;
  movements: ColorFormulaUsageMovement[];
}
