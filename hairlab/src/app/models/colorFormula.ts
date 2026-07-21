import { Oxygen } from './enums/oxygen';
import { MixingRatio } from './enums/mixingRatio';
import { ColorFormulaStatus } from './enums/colorFormulaStatus';

export interface ColorFormula {

  id?: number;

  consultationId: number;

  appointmentItemId?: number | null;

  name: string;

  targetResult: string;

  volumeDeveloper: Oxygen;

  mixingRatio: MixingRatio;

  status: ColorFormulaStatus;

  notes?: string;

  createdAt?: string;
}