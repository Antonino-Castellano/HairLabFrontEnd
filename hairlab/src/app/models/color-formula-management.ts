import {
  ColorApplicationType
} from './enums/color-application-type';

import {
  ColorFormulaStatus
} from './enums/color-formula-status';

import {
  InventoryUnit
} from './enums/inventory-unit';

import {
  MixingRatio
} from './enums/mixing-ratio';

import {
  Oxygen
} from './enums/oxygen';

import {
  Reflection
} from './enums/reflection';

import {
  ToneLevel
} from './enums/tone-level';

import {
  ColorFormula
} from './color-formula';

import {
  ColorFormulaItem
} from './color-formula-item';

/**
 * Ingrediente inviato dal Formula Builder.
 */
export interface ColorFormulaIngredientRequest {

  hairDyeId: number;

  quantity: number;

  unit: InventoryUnit;

  notes?: string;
}

/**
 * Payload aggregato di creazione/modifica.
 */
export interface ColorFormulaManagementRequest {

  customerId: number;

  consultationId?: number;

  appointmentItemId?: number;

  name: string;

  targetResult: string;

  targetToneLevel?: ToneLevel | null;

  targetPrimaryReflection?: Reflection | null;

  targetSecondaryReflection?: Reflection | null;

  applicationType: ColorApplicationType;

  volumeDeveloper: Oxygen;

  mixingRatio: MixingRatio;

  customDeveloperRatio?: number | null;

  status: ColorFormulaStatus;

  notes?: string;

  ingredients: ColorFormulaIngredientRequest[];
}

/**
 * Risposta aggregata.
 */
export interface ColorFormulaDetail {

  formula: ColorFormula;

  ingredients: ColorFormulaItem[];

  totalColorQuantity: number;

  developerQuantity: number;

  totalMixtureQuantity: number;
}
