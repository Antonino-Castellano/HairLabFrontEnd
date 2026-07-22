import {
  RecommendationItem
} from './recommendation-item';

/**
 * Risposta prodotta dal motore
 * StyleRecommendationService.
 */
export interface StyleRecommendation {

  customerId: number;

  generatedAt: string;

  hairProfileAvailable: boolean;

  faceProfileAvailable: boolean;

  colorAnalysisAvailable: boolean;

  haircutRecommendations:
    RecommendationItem[];

  fringeRecommendations:
    RecommendationItem[];

  colorRecommendations:
    RecommendationItem[];

  stylingRecommendations:
    RecommendationItem[];

  technicalWarnings: string[];

  generalNotes: string[];
}