import { Reflection } from './enums/reflection';
import { ToneLevel } from './enums/tone-level';

export type ColorFormulaFeasibility =
  | 'DIRECT_POSSIBLE'
  | 'MULTI_STEP'
  | 'NEEDS_DATA'
  | 'PROFESSIONAL_REVIEW';

/** Previsione tecnica spiegabile restituita dal backend. */
export interface ColorFormulaSimulation {
  formulaId: number;
  customerId: number;
  formulaName: string;
  currentToneLevel?: ToneLevel | null;
  targetToneLevel?: ToneLevel | null;
  toneLevelDelta?: number | null;
  currentReflection?: Reflection | null;
  targetPrimaryReflection?: Reflection | null;
  targetSecondaryReflection?: Reflection | null;
  feasibility: ColorFormulaFeasibility;
  confidencePercent: number;
  multiStepRecommended: boolean;
  protocolValid: boolean;
  profileCompleteEnough: boolean;
  strengths: string[];
  risks: string[];
  explanations: string[];
  nextActions: string[];
  generatedAt: string;
}
