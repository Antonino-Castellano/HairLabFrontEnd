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
