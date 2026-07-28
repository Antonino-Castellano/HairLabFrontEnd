import { RecommendationCategory } from './recommendation-category';

export interface RecommendationComponent {
  category: RecommendationCategory;
  code?: string | null;
  title: string;
  description?: string | null;
  referenceImageUrl?: string | null;
}
