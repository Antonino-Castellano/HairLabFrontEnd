import {
  ColorFormulaHistoryItem
} from './color-formula-history';

export interface ColorFormulaEvolutionStep {
  historyItem: ColorFormulaHistoryItem;
  currentFormula: boolean;
  referenceFormula: boolean;
}

export interface ColorFormulaEvolution {
  customerId: number;
  rootFormulaId: number;
  currentFormulaId: number;
  referenceFormulaId?: number | null;
  steps: ColorFormulaEvolutionStep[];
}
