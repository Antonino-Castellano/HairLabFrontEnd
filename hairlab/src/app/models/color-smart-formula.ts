import { ColorSmartDiagnosis } from './color-smart-diagnosis';
import { InventoryUnit } from './enums/inventory-unit';
import { MixingRatio } from './enums/mixing-ratio';
import { Oxygen } from './enums/oxygen';
import { ProductType } from './enums/product-type';
import { Reflection } from './enums/reflection';
import { ToneLevel } from './enums/tone-level';

export type ColorFormulaComponentRole =
  | 'TARGET_MATCH'
  | 'TARGET_BASE'
  | 'PRIMARY_REFLECTION_SUPPORT'
  | 'SECONDARY_REFLECTION_SUPPORT'
  | 'WHITE_HAIR_COVERAGE_BASE'
  | 'CORRECTIVE_SUPPORT';

export type TechnicalRuleSource =
  | 'PRODUCT'
  | 'LINE_PROFILE'
  | 'GENERIC';

export interface ColorSmartFormulaComponent {
  hairDyeId: number;
  brand: string;
  name: string;
  code: string;
  lineName?: string | null;
  productType: ProductType;

  defaultMixingRatio?: MixingRatio | null;
  customMixingRatioMultiplier?: number | null;
  allowedDeveloperVolumes?: Oxygen[];
  maxLiftLevels?: number | null;
  depositOnly: boolean;
  manufacturerRulesConfigured: boolean;
  technicalRuleSource?: TechnicalRuleSource;

  toneLevel?: ToneLevel | null;
  primaryReflection?: Reflection | null;
  secondaryReflection?: Reflection | null;

  role: ColorFormulaComponentRole;
  exactTargetMatch: boolean;

  stockConfigured: boolean;
  quantityAvailable?: number | null;
  inventoryUnit?: InventoryUnit | null;
  positiveStock: boolean;

  recommendedQuantity?: number | null;
  recommendedUnit?: InventoryUnit | null;
  dosageCalculated: boolean;
  manualDosageRequired: boolean;
  stockSufficient: boolean;
  shortageQuantity?: number | null;

  note?: string | null;
}

export interface ColorSmartFormulaProposal {
  code: string;
  title: string;
  description: string;

  complete: boolean;
  stockReadyForDosage: boolean;

  dosageRuleSet?: string | null;
  totalColorQuantity?: number | null;
  recommendedDeveloperVolume?: Oxygen | null;
  recommendedMixingRatio?: MixingRatio | null;
  developerMultiplier?: number | null;
  developerQuantity?: number | null;
  totalMixtureQuantity?: number | null;

  dosageComplete: boolean;
  colorStockSufficient: boolean;

  lineRuleProfileApplied: boolean;
  lineRuleBrand?: string | null;
  lineRuleName?: string | null;
  whiteHairCoverageRuleApplied: boolean;
  whiteHairNaturalBaseSharePercentage?: number | null;
  preferredLineDeveloperVolume?: Oxygen | null;
  recommendedProcessingTimeMinutes?: number | null;

  components: ColorSmartFormulaComponent[];
  missingRequirements: string[];
  notes: string[];
  dosageWarnings: string[];
}

export interface ColorSmartFormulaResponse {
  diagnosis: ColorSmartDiagnosis;
  idealProposal: ColorSmartFormulaProposal;
  inventoryProposal: ColorSmartFormulaProposal;
}
