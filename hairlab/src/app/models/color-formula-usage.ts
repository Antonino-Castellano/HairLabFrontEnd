import { InventoryUnit } from './enums/inventory-unit';
import { MixingRatio } from './enums/mixing-ratio';
import { Oxygen } from './enums/oxygen';
import { ProductType } from './enums/product-type';
import { HairDyeInventoryMovementType } from './hair-dye-inventory-movement';

export interface ColorFormulaZoneDeveloperUseRequest {
  zoneId: number;
  developerHairDyeId: number;
}

export interface ColorFormulaUseRequest {
  developerHairDyeId?: number | null;
  zoneDevelopers?: ColorFormulaZoneDeveloperUseRequest[];
  notes?: string;
}

export interface ColorFormulaUsageDeveloper {
  zoneId?: number | null;
  zoneName: string;
  developerHairDyeId: number;
  developerBrand: string;
  developerLineName?: string | null;
  developerCode: string;
  developerName: string;
  developerVolume: Oxygen;
  mixingRatio: MixingRatio;
  colorQuantity: number;
  developerQuantity: number;
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
  developerHairDyeId?: number | null;
  developerBrand?: string | null;
  developerCode?: string | null;
  developerName?: string | null;
  developerVolume?: Oxygen | null;
  totalColorQuantity: number;
  developerQuantity: number;
  developerUnit: InventoryUnit;
  totalMixtureQuantity: number;
  usedAt: string;
  notes?: string | null;
  multiZone?: boolean;
  developerUsages?: ColorFormulaUsageDeveloper[];
  movements: ColorFormulaUsageMovement[];
}
