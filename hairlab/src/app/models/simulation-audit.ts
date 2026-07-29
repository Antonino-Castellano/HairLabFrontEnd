import { SimulationProvider } from './hair-simulation';

export interface HairSimulationAudit {
  id: number;
  customerId: number;
  simulationId?: number | null;
  action: string;
  provider?: SimulationProvider | null;
  operatorEmail?: string | null;
  success: boolean;
  details?: string | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  occurredAt: string;
}
