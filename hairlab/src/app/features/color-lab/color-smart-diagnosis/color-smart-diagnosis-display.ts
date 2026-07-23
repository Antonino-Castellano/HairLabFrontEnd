import {
  ColorDiagnosisFeasibility,
  ColorDiagnosisStrategy
} from '../../../models/color-smart-diagnosis';

import {
  HairCondition
} from '../../../models/enums/hair-condition';

import {
  HairLength
} from '../../../models/enums/hair-length';

import {
  HairTexture
} from '../../../models/enums/hair-texture';

import {
  PhysicalValue
} from '../../../models/enums/physical-value';

export const COLOR_DIAGNOSIS_FEASIBILITY_LABELS:
  Record<ColorDiagnosisFeasibility, string> = {

  DIRECT_OR_LOW_COMPLEXITY:
    'Diretta / bassa complessità',

  CONTROLLED_LIFT:
    'Schiaritura controllata',

  PRELIGHTENING_LIKELY:
    'Probabile pre-schiaritura',

  DARKENING_FILL_LIKELY:
    'Probabile pre-pigmentazione',

  PROFESSIONAL_REVIEW_REQUIRED:
    'Revisione professionale richiesta'
};

export const COLOR_DIAGNOSIS_STRATEGY_LABELS:
  Record<ColorDiagnosisStrategy, string> = {

  DEPOSIT_OR_TONE:
    'Deposito / tonalizzazione',

  CONTROLLED_LIFT_AND_DEPOSIT:
    'Schiaritura controllata + deposito',

  PRELIGHTEN_THEN_TONE:
    'Pre-schiaritura + tonalizzazione',

  DARKEN_AND_DEPOSIT:
    'Scurimento / deposito',

  PREPIGMENT_THEN_DARKEN:
    'Pre-pigmentazione + scurimento',

  PROFESSIONAL_ASSESSMENT:
    'Valutazione professionale preliminare'
};

export const HAIR_CONDITION_LABELS_SMART:
  Record<HairCondition, string> = {

  [HairCondition.HEALTHY]:
    'Sano',

  [HairCondition.DRY]:
    'Secco',

  [HairCondition.DAMAGED]:
    'Danneggiato',

  [HairCondition.CHEMICALLY_TREATED]:
    'Trattato chimicamente'
};

export const HAIR_LENGTH_LABELS_SMART:
  Record<HairLength, string> = {

  [HairLength.VERY_SHORT]:
    'Molto corti',

  [HairLength.SHORT]:
    'Corti',

  [HairLength.MEDIUM]:
    'Medi',

  [HairLength.LONG]:
    'Lunghi',

  [HairLength.VERY_LONG]:
    'Molto lunghi'
};

export const HAIR_TEXTURE_LABELS_SMART:
  Record<HairTexture, string> = {

  [HairTexture.FINE]:
    'Fine',

  [HairTexture.MEDIUM]:
    'Media',

  [HairTexture.COARSE]:
    'Grossa'
};

export const PHYSICAL_VALUE_LABELS_SMART:
  Record<PhysicalValue, string> = {

  [PhysicalValue.LOW]:
    'Bassa',

  [PhysicalValue.MEDIUM]:
    'Media',

  [PhysicalValue.HIGH]:
    'Alta'
};
