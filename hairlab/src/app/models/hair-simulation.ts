import { FutureSimulationSpec } from './future-simulation-spec';

export type SimulationType = 'HAIRCUT' | 'FRINGE' | 'BEARD' | 'COLOR' | 'TOTAL_LOOK';
export type SimulationStatus =
  'DRAFT' | 'READY' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type SimulationProvider = 'NONE' | 'MOCK' | 'OPENAI' | 'LOCAL_COMFYUI';

export interface HairSimulation {
  id: number;
  customerId: number;
  sourcePhotoId?: number | null;
  consentId?: number | null;
  sourceImageUrl?: string | null;
  simulationType: SimulationType;
  recommendationCode: string;
  recommendationTitle: string;
  technicalSpec?: FutureSimulationSpec | null;
  generatedImageUrl?: string | null;
  status: SimulationStatus;
  provider: SimulationProvider;
  errorMessage?: string | null;
  professionalSummary?: string | null;
  instructionPrompt?: string | null;
  negativePrompt?: string | null;
  providerRequestId?: string | null;
  generationAttempts: number;
  generationFingerprint?: string | null;
  inputImageChecksum?: string | null;
  cachedFromSimulationId?: number | null;
  modelName?: string | null;
  modelVersion?: string | null;
  workflowCode?: string | null;
  workflowVersion?: string | null;
  quality?: string | null;
  imageSize?: string | null;
  promptVersion?: string | null;
  providerServerUrl?: string | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  generationDurationMs?: number | null;
  manualConfirmation: boolean;
  requestedBy?: string | null;
  requestedAt: string;
  queuedAt?: string | null;
  processingAt?: string | null;
  updatedAt: string;
  completedAt?: string | null;
  active: boolean;
}

export interface CreateHairSimulationRequest {
  sourcePhotoId?: number | null;
  simulationType: SimulationType;
  recommendationCode: string;
  recommendationTitle: string;
  technicalSpec?: FutureSimulationSpec | null;
}

export interface GenerateHairSimulationRequest {
  provider?: SimulationProvider | null;
  force?: boolean;
  manualConfirmation?: boolean;
  rememberProviderPreference?: boolean;
}

export interface SimulationProviderAvailability {
  provider: SimulationProvider;
  available: boolean;
  realAi: boolean;
  paid: boolean;
  confirmationRequired: boolean;
  defaultProvider: boolean;
  preferredProvider: boolean;
  description: string;
  diagnosticMessage?: string | null;
  model?: string | null;
  modelVersion?: string | null;
  quality?: string | null;
  imageSize?: string | null;
  workflowCode?: string | null;
  estimatedCostUsd?: number | null;
  budgetRemainingUsd?: number | null;
}

export interface SimulationGenerationQuote {
  simulationId: number;
  provider: SimulationProvider;
  providerAvailable: boolean;
  consentValid: boolean;
  cacheHit: boolean;
  cachedSimulationId?: number | null;
  manualConfirmationRequired: boolean;
  model?: string | null;
  modelVersion?: string | null;
  quality?: string | null;
  imageSize?: string | null;
  workflowCode?: string | null;
  estimatedCostUsd?: number | null;
  budgetRemainingUsd?: number | null;
  message: string;
}

export interface ProviderPreference {
  preferredProvider?: SimulationProvider | null;
  effectiveProvider: SimulationProvider;
}

export interface AiBudgetSummary {
  monthlyBudgetUsd: number;
  usedUsd: number;
  remainingUsd: number;
  maxSuccessfulGenerations: number;
  successfulGenerations: number;
  available: boolean;
}
