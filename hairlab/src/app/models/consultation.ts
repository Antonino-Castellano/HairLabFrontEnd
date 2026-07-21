import { ConsultationType } from './enums/consultationType';
import { FeasibilityStatus } from './enums/feasibilityStatus';

export interface Consultation {

  id?: number;

  customerId: number;

  employeeId: number;

  appointmentId?: number | null;

  consultationDate: string;

  type: ConsultationType;

  objective: string;

  initialDiagnosis: string;

  currentCondition: string;

  feasibility?: FeasibilityStatus;

  risks?: string;

  proposedProcedure: string;

  technicalNotes: string;
}