import {
  ColorFormula
} from './color-formula';

import {
  ColorFormulaUsage
} from './color-formula-usage';

import {
  ColorFormulaResult
} from './color-formula-result';

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

  result?: ColorFormulaResult | null;
}

export interface ColorFormulaCustomerHistory {

  customerId: number;

  totalCount: number;

  draftCount: number;

  proposedCount: number;

  usedCount: number;

  archivedCount: number;

  resultRecordedCount: number;

  resultPendingCount: number;

  positiveResultCount: number;

  attentionResultCount: number;

  latestUsedFormulaId?: number | null;

  latestUsedAt?: string | null;

  referenceFormulaId?: number | null;

  referenceFormulaSetAt?: string | null;

  items: ColorFormulaHistoryItem[];
}
