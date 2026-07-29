/** Specifica tecnica strutturata usata dal costruttore delle istruzioni IA. */
export interface FutureSimulationSpec {
  aiEnabled: boolean;
  integrationStatus: 'DATA_ONLY' | 'PREVIEW_STRUCTURE_READY' | 'PROVIDER_STRUCTURE_READY' | string;
  sourcePhotoRequired?: boolean;
  haircutCode?: string | null;
  fringeCode?: string | null;
  beardStyleCode?: string | null;
  hairColorCode?: string | null;
  hairColorTechnique?: string | null;
  hairColorPlacement?: string | null;
  beardLengthMm?: number | null;
  preserveIdentity?: boolean;
  preserveFace?: boolean;
  preserveSkinTone?: boolean;
  preservePose?: boolean;
  preserveBackground?: boolean;
  preserveClothing?: boolean;
  preserveMakeup?: boolean;
  negativeInstructions?: string[];
  technicalAttributes: Record<string, string>;
}
