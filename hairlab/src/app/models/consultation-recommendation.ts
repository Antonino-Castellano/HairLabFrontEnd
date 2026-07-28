import { RecommendationCategory } from './recommendation-category';
import { RecommendationItem } from './recommendation-item';

export type RecommendationDecisionStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED';

/** Snapshot storico di un suggerimento HairLab salvato in una consulenza. */
export interface ConsultationRecommendation {
  id: number;
  consultationId: number;
  category: RecommendationCategory;
  recommendationCode: string;
  title: string;
  compatibilityScore: number;
  decisionStatus: RecommendationDecisionStatus;
  decisionNotes?: string | null;
  selectedAt: string;
  decidedAt?: string | null;
  recommendationSnapshot?: RecommendationItem | null;
}

export interface SaveConsultationRecommendationRequest {
  category: RecommendationCategory;
  recommendationCode: string;
  decisionStatus?: RecommendationDecisionStatus;
  decisionNotes?: string | null;
}

export interface UpdateConsultationRecommendationDecisionRequest {
  decisionStatus: RecommendationDecisionStatus;
  decisionNotes?: string | null;
}
