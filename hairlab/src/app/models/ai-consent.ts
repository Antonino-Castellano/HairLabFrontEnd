export interface CustomerAiConsent {
  id?: number | null;
  customerId: number;
  active: boolean;
  valid: boolean;
  documentVersion?: string | null;
  grantedAt?: string | null;
  grantedBy?: string | null;
  revokedAt?: string | null;
  revokedBy?: string | null;
  revocationReason?: string | null;
  notes?: string | null;
}

export interface GrantAiConsentRequest {
  confirmed: boolean;
  documentVersion: string;
  notes?: string | null;
}

export interface RevokeAiConsentRequest {
  reason?: string | null;
  deletePhotos: boolean;
  deleteSimulations: boolean;
}
