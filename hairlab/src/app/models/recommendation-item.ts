import { ColorRecommendationTarget } from './color-recommendation-target';

/**
 * Singolo suggerimento generato
 * dal motore HairLab.
 */
export interface RecommendationItem {

  /** Codice stabile, utile per collegare il suggerimento ad altri moduli. */
  code?: string | null;

  /** Target tecnico opzionale utilizzabile da Smart Formula. */
  technicalColorTarget?: ColorRecommendationTarget | null;

  /**
   * Titolo.
   *
   * Esempio:
   * Long bob alla clavicola.
   */
  title: string;

  /**
   * Spiegazione sintetica.
   */
  description: string;

  /**
   * Compatibilità HairLab.
   *
   * Range 0 - 100.
   *
   * Non rappresenta una probabilità scientifica.
   */
  compatibilityScore: number;

  /**
   * Motivazioni che hanno portato
   * al suggerimento.
   */
  reasons: string[];
}