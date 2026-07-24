import {
  Oxygen
} from './enums/oxygen';

import {
  MixingRatio
} from './enums/mixing-ratio';

import {
  ColorFormulaStatus
} from './enums/color-formula-status';

import {
  ColorFormulaOrigin
} from './enums/color-formula-origin';

import {
  ColorApplicationType
} from './enums/color-application-type';

import {
  ToneLevel
} from './enums/tone-level';

import {
  Reflection
} from './enums/reflection';

/**
 * Formula colore collegata direttamente
 * a una cliente HairLab.
 */
export interface ColorFormula {

  id?: number;

  /**
   * Obbligatorio per le nuove formule.
   *
   * È opzionale nel type durante la fase
   * di transizione per non rompere
   * eventuali dati frontend legacy.
   */
  customerId?: number;

  consultationId?: number | null;

  appointmentItemId?: number | null;

  /** Origine della formula: manuale, Smart Formula o revisione. */
  origin?: ColorFormulaOrigin | null;

  /** Formula da cui deriva questa revisione. */
  parentFormulaId?: number | null;

  /** Numero progressivo della revisione. */
  revisionNumber?: number | null;

  /** True se è la formula di riferimento corrente della cliente. */
  referenceFormula?: boolean | null;

  /** Data in cui è stata impostata come riferimento. */
  referenceSetAt?: string | null;

  /** Formula di riferimento da cui nasce un nuovo servizio ricorrente. */
  referenceSourceFormulaId?: number | null;

  /** Suggerimento HairLab di origine, se presente. */
  sourceRecommendationCode?: string | null;

  sourceRecommendationTitle?: string | null;

  /** Profilo tecnico di linea applicato alla Smart Formula. */
  technicalLineBrand?: string | null;

  technicalLineName?: string | null;

  whiteHairCoverageApplied?: boolean | null;

  whiteHairNaturalBaseSharePercentage?: number | null;

  recommendedProcessingTimeMinutes?: number | null;

  name: string;

  targetResult: string;

  targetToneLevel?: ToneLevel | null;

  targetPrimaryReflection?: Reflection | null;

  targetSecondaryReflection?: Reflection | null;

  applicationType?: ColorApplicationType | null;

  volumeDeveloper: Oxygen;

  mixingRatio: MixingRatio;

  /**
   * Moltiplicatore usato soltanto
   * quando mixingRatio = CUSTOM.
   *
   * Esempio:
   * 1 : 1.8 -> 1.8
   */
  customDeveloperRatio?: number | null;

  status: ColorFormulaStatus;

  notes?: string;

  createdAt?: string;
}
