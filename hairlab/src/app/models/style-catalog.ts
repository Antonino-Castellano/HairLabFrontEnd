import { Gender } from './gender';

export type CatalogTab = 'haircuts' | 'fringes' | 'beards';

export interface HaircutDefinitionCatalog {
  id?: number;
  code: string;
  name: string;
  gender: Gender;
  family: string;
  lengthCategory: string;
  silhouette: string;
  layerStructure: string;
  perimeterShape: string;
  defaultFringeType: string;
  napeShape: string;
  fadeType: string;
  earExposure: string;
  undercutPresent: boolean;
  asymmetrical: boolean;
  disconnected: boolean;
  faceFramingPresent: boolean;
  crownLengthMinMm?: number | null;
  crownLengthMaxMm?: number | null;
  fringeLengthMinMm?: number | null;
  fringeLengthMaxMm?: number | null;
  sideLengthMinMm?: number | null;
  sideLengthMaxMm?: number | null;
  napeLengthMinMm?: number | null;
  napeLengthMaxMm?: number | null;
  referenceImageUrl?: string | null;
  tutorialUrl?: string | null;
  tutorialLabel?: string | null;
  technicalDescription: string;
  futureSimulationDescriptor?: string | null;
  futureSimulationReady: boolean;
  active: boolean;
  compatibleFaceShapes: string[];
  compatibleHairTypes: string[];
  compatibleDensities: string[];
  compatibleCurrentLengths: string[];
}

export interface FringeDefinitionCatalog {
  id?: number;
  code: string;
  name: string;
  gender: Gender;
  fringeType: string;
  centerLengthMinMm?: number | null;
  centerLengthMaxMm?: number | null;
  sideLengthMinMm?: number | null;
  sideLengthMaxMm?: number | null;
  referenceImageUrl?: string | null;
  technicalDescription: string;
  futureSimulationDescriptor?: string | null;
  futureSimulationReady: boolean;
  active: boolean;
  compatibleFaceShapes: string[];
  compatibleForeheadLevels: string[];
  compatibleHairTypes: string[];
  compatibleDensities: string[];
}

export interface BeardStyleDefinitionCatalog {
  id?: number;
  code: string;
  name: string;
  style: string;
  suggestedLength: string;
  minLengthMm?: number | null;
  maxLengthMm?: number | null;
  moustacheStyle: string;
  moustacheConnection: string;
  cheekLine: string;
  neckline: string;
  referenceImageUrl?: string | null;
  technicalDescription: string;
  futureSimulationDescriptor?: string | null;
  futureSimulationReady: boolean;
  active: boolean;
  compatibleFaceShapes: string[];
  compatibleDensities: string[];
  compatibleGrowthPatterns: string[];
}

export type StyleCatalogItem =
  HaircutDefinitionCatalog | FringeDefinitionCatalog | BeardStyleDefinitionCatalog;

export interface StyleCatalogSummary {
  totalHaircuts: number;
  femaleHaircuts: number;
  maleHaircuts: number;
  fringes: number;
  beardStyles: number;
  haircutFamilies: Record<string, number>;
}

export interface HaircutCatalogFilters {
  gender?: Gender | '';
  query?: string;
  family?: string;
  lengthCategory?: string;
  hairType?: string;
  faceShape?: string;
  density?: string;
  undercutPresent?: string;
  fadeType?: string;
  fringeType?: string;
  includeInactive?: boolean;
}

export interface FringeCatalogFilters {
  gender?: Gender | '';
  query?: string;
  fringeType?: string;
  faceShape?: string;
  hairType?: string;
  density?: string;
  includeInactive?: boolean;
}

export interface BeardCatalogFilters {
  query?: string;
  style?: string;
  length?: string;
  faceShape?: string;
  density?: string;
  growthPattern?: string;
  includeInactive?: boolean;
}
