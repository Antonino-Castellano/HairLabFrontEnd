import {
  ColorFormulaComponentRole
} from '../../../models/color-smart-formula';

export const COLOR_FORMULA_COMPONENT_ROLE_LABELS:
  Record<ColorFormulaComponentRole, string> = {

  TARGET_MATCH:
    'Match diretto target',

  TARGET_BASE:
    'Base target',

  PRIMARY_REFLECTION_SUPPORT:
    'Supporto riflesso primario',

  SECONDARY_REFLECTION_SUPPORT:
    'Supporto secondo riflesso',

  CORRECTIVE_SUPPORT:
    'Correttore'
};
