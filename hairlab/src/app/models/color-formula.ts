import { Oxygen } from './enums/oxygen';
import { MixingRatio } from './enums/mixing-ratio';
import { ColorFormulaStatus } from './enums/color-formula-status';

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