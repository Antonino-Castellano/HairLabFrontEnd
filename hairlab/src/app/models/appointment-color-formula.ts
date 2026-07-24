import { ColorFormulaOrigin } from './enums/color-formula-origin';
import { ColorFormulaStatus } from './enums/color-formula-status';
import { ColorResultAssessment } from './color-formula-result';

export interface AppointmentColorFormulaLink {
  appointmentItemId: number;
  formulaId: number;
  formulaName: string;
  status: ColorFormulaStatus;
  origin?: ColorFormulaOrigin | null;
  revisionNumber?: number | null;
  referenceFormula: boolean;
  referenceSourceFormulaId?: number | null;
  resultAssessment?: ColorResultAssessment | null;
  createdAt?: string | null;
}
