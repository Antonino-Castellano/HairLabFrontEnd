import {
  ColorApplicationType
} from './enums/color-application-type';

import {
  HairCondition
} from './enums/hair-condition';

import {
  HairLength
} from './enums/hair-length';

import {
  HairTexture
} from './enums/hair-texture';

import {
  PhysicalValue
} from './enums/physical-value';

import {
  Reflection
} from './enums/reflection';

import {
  ToneLevel
} from './enums/tone-level';

/**
 * Codici restituiti dal backend.
 */
export type ColorDiagnosisFeasibility =
  | 'DIRECT_OR_LOW_COMPLEXITY'
  | 'CONTROLLED_LIFT'
  | 'PRELIGHTENING_LIKELY'
  | 'DARKENING_FILL_LIKELY'
  | 'PROFESSIONAL_REVIEW_REQUIRED';

export type ColorDiagnosisStrategy =
  | 'DEPOSIT_OR_TONE'
  | 'CONTROLLED_LIFT_AND_DEPOSIT'
  | 'PRELIGHTEN_THEN_TONE'
  | 'DARKEN_AND_DEPOSIT'
  | 'PREPIGMENT_THEN_DARKEN'
  | 'PROFESSIONAL_ASSESSMENT';

/**
 * Input Smart Diagnosis.
 */
export interface ColorSmartDiagnosisRequest {

  customerId: number;

  targetToneLevel: ToneLevel;

  targetPrimaryReflection: Reflection;

  targetSecondaryReflection?: Reflection | null;

  applicationType: ColorApplicationType;

  targetResult?: string;
}

/**
 * Output spiegabile del motore tecnico.
 */
export interface ColorSmartDiagnosis {

  customerId: number;

  hairProfileId: number;

  naturalTone: ToneLevel;

  currentTone: ToneLevel;

  currentReflection: Reflection;

  hairLength?: HairLength | null;

  texture: HairTexture;

  density: PhysicalValue;

  porosity: PhysicalValue;

  hairCondition: HairCondition;

  targetToneLevel: ToneLevel;

  targetPrimaryReflection: Reflection;

  targetSecondaryReflection?: Reflection | null;

  applicationType: ColorApplicationType;

  targetResult?: string | null;

  toneDifference: number;

  feasibility: ColorDiagnosisFeasibility;

  strategy: ColorDiagnosisStrategy;

  recommendedReflectionFamilies: Reflection[];

  reasons: string[];

  warnings: string[];

  automaticFormulaCandidate: boolean;

  strandTestRecommended: boolean;
}
