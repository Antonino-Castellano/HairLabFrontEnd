export type ColorLearningEvidenceLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface ColorLearningInsight {
  customerId: number;
  hasEvidence: boolean;
  evaluatedResults: number;
  evidenceLevel: ColorLearningEvidenceLevel;
  summary: string;
  suggestedReferenceFormulaId?: number | null;
  suggestedReferenceFormulaName?: string | null;
  observations: string[];
  recommendations: string[];
  evidence: string[];
}
