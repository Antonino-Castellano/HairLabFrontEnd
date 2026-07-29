export type PhotoAnalysisProviderType = 'MOCK' | 'OLLAMA_VISION' | 'OPENAI_VISION';
export type PhotoAnalysisType = 'HAIR_PROFILE' | 'FACE_PROFILE' | 'COLOR_ANALYSIS' | 'COMPLETE';
export type PhotoAnalysisStatus =
  'DRAFT' | 'UNDER_REVIEW' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'REJECTED' | 'FAILED';
export type PhotoAnalysisFieldDecision = 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED';
export type PhotoAnalysisApplyMode = 'SELECTED_FIELDS' | 'EMPTY_FIELDS_ONLY';

export interface PhotoQualityAssessment {
  usable: boolean;
  score?: number | null;
  lighting?: string | null;
  sharpness?: string | null;
  pose?: string | null;
  framing?: string | null;
  warnings: string[];
}

export interface PhotoAnalysisField {
  section: 'HAIR_PROFILE' | 'FACE_PROFILE' | 'COLOR_ANALYSIS';
  fieldName: string;
  label: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  editedValue?: string | null;
  confidence?: number | null;
  reason?: string | null;
  warning?: string | null;
  decision: PhotoAnalysisFieldDecision;
  allowedValues: string[];
}

export interface CustomerPhotoAnalysis {
  id: number;
  customerId: number;
  sourcePhotoId?: number | null;
  sourceImageUrl: string;
  sourceChecksum: string;
  analysisType: PhotoAnalysisType;
  provider: PhotoAnalysisProviderType;
  modelName?: string | null;
  modelVersion?: string | null;
  providerRequestId?: string | null;
  status: PhotoAnalysisStatus;
  photoQuality?: PhotoQualityAssessment | null;
  warnings: string[];
  fields: PhotoAnalysisField[];
  createdBy?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  estimatedCostUsd?: number | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  appliedToOfficialProfiles: boolean;
}

export interface PhotoAnalysisProviderAvailability {
  provider: PhotoAnalysisProviderType;
  available: boolean;
  paid: boolean;
  model?: string | null;
  modelVersion?: string | null;
  message: string;
  estimatedCostUsd?: number | null;
  serverUrl?: string | null;
}

export interface CreateCustomerPhotoAnalysisRequest {
  sourcePhotoId?: number | null;
  analysisType: PhotoAnalysisType;
  provider: PhotoAnalysisProviderType;
  confirmed: boolean;
}

export interface ReviewPhotoAnalysisField {
  section: string;
  fieldName: string;
  editedValue?: string | null;
  decision: PhotoAnalysisFieldDecision;
}

export interface ReviewCustomerPhotoAnalysisRequest {
  fields: ReviewPhotoAnalysisField[];
  applyMode: PhotoAnalysisApplyMode;
  applyNow: boolean;
  allowLowQualityOverride: boolean;
}

export interface CustomerPhotoAnalysisAudit {
  id: number;
  customerId: number;
  analysisId?: number | null;
  action: string;
  provider?: PhotoAnalysisProviderType | null;
  operatorEmail?: string | null;
  success: boolean;
  details?: string | null;
  occurredAt: string;
}
