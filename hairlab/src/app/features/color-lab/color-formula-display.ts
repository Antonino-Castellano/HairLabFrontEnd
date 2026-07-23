import {
  ColorApplicationType
} from '../../models/enums/color-application-type';

import {
  ColorFormulaStatus
} from '../../models/enums/color-formula-status';

import {
  MixingRatio
} from '../../models/enums/mixing-ratio';

import {
  Oxygen
} from '../../models/enums/oxygen';

/**
 * Traduzioni visuali del Formula Builder.
 */
export const COLOR_APPLICATION_LABELS:
  Record<ColorApplicationType, string> = {

  [ColorApplicationType.ROOT_REGROWTH]:
    'Ricrescita',

  [ColorApplicationType.FULL_HEAD]:
    'Testa completa',

  [ColorApplicationType.LENGTHS_AND_ENDS]:
    'Lunghezze e punte',

  [ColorApplicationType.TONING]:
    'Tonalizzazione / Gloss',

  [ColorApplicationType.PARTIAL]:
    'Applicazione parziale',

  [ColorApplicationType.HIGHLIGHTS]:
    'Schiariture / Highlights'
};

export const OXYGEN_LABELS:
  Record<Oxygen, string> = {

  [Oxygen.VOL_6]:
    '6 vol',

  [Oxygen.VOL_9]:
    '9 vol',

  [Oxygen.VOL_10]:
    '10 vol',

  [Oxygen.VOL_12]:
    '12 vol',

  [Oxygen.VOL_20]:
    '20 vol',

  [Oxygen.VOL_30]:
    '30 vol',

  [Oxygen.VOL_40]:
    '40 vol'
};

export const MIXING_RATIO_LABELS:
  Record<MixingRatio, string> = {

  [MixingRatio.RATIO_1_TO_1]:
    '1 : 1',

  [MixingRatio.RATIO_1_TO_1_5]:
    '1 : 1.5',

  [MixingRatio.RATIO_1_TO_2]:
    '1 : 2',

  [MixingRatio.RATIO_1_TO_3]:
    '1 : 3',

  [MixingRatio.CUSTOM]:
    'Personalizzato'
};

export const COLOR_FORMULA_STATUS_LABELS:
  Record<ColorFormulaStatus, string> = {

  [ColorFormulaStatus.DRAFT]:
    'Bozza',

  [ColorFormulaStatus.PROPOSED]:
    'Proposta',

  [ColorFormulaStatus.USED]:
    'Utilizzata',

  [ColorFormulaStatus.ARCHIVED]:
    'Archiviata'
};
