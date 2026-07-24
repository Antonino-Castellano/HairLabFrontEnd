import { ColorApplicationType } from './enums/color-application-type';
import { Reflection } from './enums/reflection';
import { ToneLevel } from './enums/tone-level';

/**
 * Target tecnico strutturato collegato a un suggerimento colore HairLab.
 * Non è ancora una formula: Smart Formula lo adatta al cliente reale.
 */
export interface ColorRecommendationTarget {
  code: string;
  smartFormulaEligible: boolean;
  targetToneLevel: ToneLevel;
  targetPrimaryReflection: Reflection;
  targetSecondaryReflection?: Reflection | null;
  suggestedApplicationType: ColorApplicationType;
  targetResult: string;
  technicalNote?: string | null;
}
