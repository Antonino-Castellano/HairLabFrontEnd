import { ColorRecommendationTarget } from './color-recommendation-target';
import { FutureSimulationSpec } from './future-simulation-spec';
import { RecommendationComponent } from './recommendation-component';
import { RecommendationCategory } from './recommendation-category';

/** Singola proposta prodotta dal motore HairLab. */
export interface RecommendationItem {
  code?: string | null;
  category: RecommendationCategory;
  technicalColorTarget?: ColorRecommendationTarget | null;
  title: string;
  description: string;
  referenceImageUrl?: string | null;
  compatibilityScore: number;
  reasons: string[];
  components: RecommendationComponent[];
  technicalDetails: Record<string, string>;
  componentAverageScore?: number | null;
  compatibilityAdjustment?: number | null;
  combinationValidated?: boolean;
  compatibilityRules?: string[];
  compatibilityWarnings?: string[];
  futureSimulation?: FutureSimulationSpec | null;
}
