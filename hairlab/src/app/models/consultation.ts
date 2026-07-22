import { ConsultationType } from './enums/consultation-type';
import { FeasibilityStatus } from './enums/feasibility-status';

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