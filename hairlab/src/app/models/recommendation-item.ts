/**
 * Singolo suggerimento generato
 * dal motore HairLab.
 */
export interface RecommendationItem {

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