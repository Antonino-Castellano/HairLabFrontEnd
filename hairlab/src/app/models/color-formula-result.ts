import {
  Reflection
} from './enums/reflection';

import {
  ToneLevel
} from './enums/tone-level';

export type ColorResultAssessment =
  | 'EXCELLENT'
  | 'GOOD'
  | 'PARTIAL'
  | 'CORRECTION_REQUIRED';

export interface ColorFormulaResultRequest {

  achievedToneLevel?: ToneLevel | null;

  achievedPrimaryReflection?: Reflection | null;

  achievedSecondaryReflection?: Reflection | null;

  assessment: ColorResultAssessment;

  technicalNotes?: string | null;

  correctionNotes?: string | null;

  clientFeedback?: string | null;
}

export interface ColorFormulaResult
  extends ColorFormulaResultRequest {

  id: number;

  formulaId: number;

  customerId: number;

  createdAt: string;

  updatedAt: string;
}
