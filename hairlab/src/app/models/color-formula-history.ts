import {
  ColorFormula
} from './color-formula';

import {
  ColorFormulaUsage
} from './color-formula-usage';

import {
  InventoryUnit
} from './enums/inventory-unit';

import {
  ProductType
} from './enums/product-type';

export interface ColorFormulaHistoryIngredient {

  hairDyeId: number;

  brand: string;

  code: string;

  name: string;

  productType: ProductType;

  quantity: number;

  unit: InventoryUnit;

  notes?: string | null;
}

export interface ColorFormulaHistoryItem {

  formula: ColorFormula;

  ingredients: ColorFormulaHistoryIngredient[];

  totalColorQuantity: number;

  developerQuantity: number;

  totalMixtureQuantity: number;

  usage?: ColorFormulaUsage | null;
}

export interface ColorFormulaCustomerHistory {

  customerId: number;

  totalCount: number;

  draftCount: number;

  proposedCount: number;

  usedCount: number;

  archivedCount: number;

  latestUsedFormulaId?: number | null;

  latestUsedAt?: string | null;

  items: ColorFormulaHistoryItem[];
}
