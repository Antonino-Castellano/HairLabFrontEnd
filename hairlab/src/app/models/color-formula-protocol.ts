import { ColorApplicationType } from './enums/color-application-type';
import { InventoryUnit } from './enums/inventory-unit';
import { MixingRatio } from './enums/mixing-ratio';
import { Oxygen } from './enums/oxygen';
import { ProductType } from './enums/product-type';

export type ColorFormulaZoneType =
  | 'ROOTS'
  | 'LENGTHS'
  | 'ENDS'
  | 'HAIRLINE'
  | 'PARTIAL'
  | 'CUSTOM';

export type ColorFormulaProtocolStepType =
  | 'DIAGNOSIS'
  | 'COLOR_REMOVAL'
  | 'PRELIGHTENING'
  | 'PREPIGMENTATION'
  | 'ROOT_APPLICATION'
  | 'LENGTHS_APPLICATION'
  | 'TONING'
  | 'GLOSS'
  | 'REEVALUATION'
  | 'TREATMENT'
  | 'CUSTOM';

export interface ColorFormulaZoneIngredientRequest {
  hairDyeId: number;
  quantity: number;
  unit: InventoryUnit;
  notes?: string;
}

export interface ColorFormulaZoneRequest {
  zoneType: ColorFormulaZoneType;
  name: string;
  orderIndex: number;
  applicationType?: ColorApplicationType | null;
  developerVolume: Oxygen;
  mixingRatio: MixingRatio;
  customDeveloperRatio?: number | null;
  processingTimeMinutes?: number | null;
  notes?: string;
  ingredients: ColorFormulaZoneIngredientRequest[];
}

export interface ColorFormulaZoneIngredient {
  id?: number;
  hairDyeId: number;
  brand: string;
  lineName?: string | null;
  code: string;
  name: string;
  productType: ProductType;
  quantity: number;
  unit: InventoryUnit;
  notes?: string | null;
}

export interface ColorFormulaZone {
  id?: number;
  zoneType: ColorFormulaZoneType;
  name: string;
  orderIndex: number;
  applicationType?: ColorApplicationType | null;
  developerVolume: Oxygen;
  mixingRatio: MixingRatio;
  customDeveloperRatio?: number | null;
  processingTimeMinutes?: number | null;
  notes?: string | null;
  ingredients: ColorFormulaZoneIngredient[];
}

export interface ColorFormulaProtocolStepRequest {
  orderIndex: number;
  stepType: ColorFormulaProtocolStepType;
  title: string;
  description?: string;
  requiresReevaluation: boolean;
  blocksNextStepUntilReevaluation: boolean;
  estimatedMinutes?: number | null;
  notes?: string;
}

export interface ColorFormulaProtocolStep extends ColorFormulaProtocolStepRequest {
  id?: number;
}

export interface ColorFormulaCompatibilityIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
  message: string;
  zoneId?: number | null;
  zoneName?: string | null;
}

export interface ColorFormulaCompatibilityReport {
  valid: boolean;
  executionReady: boolean;
  multiLine: boolean;
  multipleDeveloperVolumes: boolean;
  multipleMixingRatios: boolean;
  checkedAt: string;
  issues: ColorFormulaCompatibilityIssue[];
}

export interface ColorFormulaProtocolRequest {
  zones: ColorFormulaZoneRequest[];
  steps: ColorFormulaProtocolStepRequest[];
}

export interface ColorFormulaProtocol {
  formulaId: number;
  multiZone: boolean;
  multiStep: boolean;
  zones: ColorFormulaZone[];
  steps: ColorFormulaProtocolStep[];
  compatibility: ColorFormulaCompatibilityReport;
}
