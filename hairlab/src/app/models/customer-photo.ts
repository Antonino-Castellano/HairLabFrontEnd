export type CustomerPhotoType =
  'PROFILE' | 'TECHNICAL' | 'CONSULTATION' | 'APPOINTMENT' | 'SIMULATION_SOURCE';

export type CustomerPhotoSource =
  'PROFILE_IMAGE' | 'MANUAL_UPLOAD' | 'CONSULTATION' | 'APPOINTMENT' | 'CAMERA';

export interface CustomerPhoto {
  id?: number | null;
  customerId: number;
  imageUrl: string;
  originalFilename?: string | null;
  photoType: CustomerPhotoType;
  source: CustomerPhotoSource;
  description?: string | null;
  capturedAt?: string | null;
  primaryPhoto: boolean;
  simulationSource: boolean;
  active: boolean;
  profileFallback?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}
