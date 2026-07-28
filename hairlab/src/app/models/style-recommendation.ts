import { Gender } from './gender';
import { RecommendationItem } from './recommendation-item';

export interface StyleRecommendation {
  customerId: number;
  gender: Gender;
  generatedAt: string;
  hairProfileAvailable: boolean;
  faceProfileAvailable: boolean;
  colorAnalysisAvailable: boolean;
  beardProfileAvailable: boolean;
  haircutRecommendations: RecommendationItem[];
  fringeRecommendations: RecommendationItem[];
  beardRecommendations: RecommendationItem[];
  colorRecommendations: RecommendationItem[];
  totalLookRecommendations: RecommendationItem[];
  stylingRecommendations: RecommendationItem[];
  technicalWarnings: string[];
  generalNotes: string[];
}
