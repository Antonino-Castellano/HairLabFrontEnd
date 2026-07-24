import {
  Reflection
} from './enums/reflection';

import {
  ToneLevel
} from './enums/tone-level';

export type ColorHistoryInsightLevel =
  | 'NONE'
  | 'INFO'
  | 'CAUTION'
  | 'WARNING';

/**
 * Sintesi deterministica dello storico tecnico
 * della cliente.
 */
export interface ColorSmartHistoryInsight {

  customerId: number;

  hasHistory: boolean;

  evaluatedResults: number;

  level: ColorHistoryInsightLevel;

  summary: string;

  latestFormulaId?: number | null;

  latestResultAt?: string | null;

  latestTargetTone?: ToneLevel | null;

  latestAchievedTone?: ToneLevel | null;

  latestTargetPrimaryReflection?: Reflection | null;

  latestAchievedPrimaryReflection?: Reflection | null;

  toneDeviationCount: number;

  reflectionDeviationCount: number;

  problematicAssessmentCount: number;

  observations: string[];

  previousCorrectionHints: string[];
}
