import {
  ColorAnalysis
} from './color-analysis';

import {
  Customer
} from './customer';

import {
  FaceProfile
} from './face-profile';

import {
  HairProfile
} from './hair-profile';

import {
  StyleRecommendation
} from './style-recommendation';

/**
 * Scheda tecnica completa
 * della cliente.
 *
 * Corrisponde al CustomerAnalysisDto
 * aggregato del backend.
 */
export interface CustomerAnalysis {

  /**
   * Dati anagrafici.
   */
  customer: Customer;

  /**
   * Profilo capelli.
   *
   * Può non essere ancora presente.
   */
  hairProfile:
    HairProfile | null;

  /**
   * Profilo del viso.
   */
  faceProfile:
    FaceProfile | null;

  /**
   * Analisi cromatica.
   */
  colorAnalysis:
    ColorAnalysis | null;

  /**
   * Suggerimenti dinamici.
   */
  recommendations:
    StyleRecommendation;

  /**
   * true quando tutti i profili
   * principali sono presenti.
   */
  completeProfile: boolean;

  /**
   * Sezioni ancora mancanti.
   */
  missingSections: string[];
}