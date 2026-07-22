import {
  Chroma,
  ColorSeason,
  ColorSubSeason,
  ColorValue,
  ContrastLevel,
  MetalType,
  SkinTone,
  Undertone
} from './enums/color-analysis-enums';

/**
 * Dizionario:
 *
 * nome colore -> HEX.
 */
export type ColorPalette =
  Record<string, string>;

/**
 * Analisi cromatica / armocromatica.
 */
export interface ColorAnalysis {

  id?: number;

  customerId: number;

  /*
   * ==========================================================
   * PELLE
   * ==========================================================
   */

  /**
   * Classificazione generale
   * della profondità.
   */
  skinTone?:
    SkinTone | null;

  /**
   * Colore HEX reale scelto
   * come riferimento della pelle.
   *
   * Esempio:
   *
   * #C58A70
   */
  skinReferenceColor?:
    string | null;

  undertone?:
    Undertone | null;

  /*
   * ==========================================================
   * ARMOCROMIA
   * ==========================================================
   */
  season?:
    ColorSeason | null;

  subSeason?:
    ColorSubSeason | null;

  colorValue?:
    ColorValue | null;

  contrastLevel?:
    ContrastLevel | null;

  chroma?:
    Chroma | null;

  /*
   * ==========================================================
   * PALETTE
   * ==========================================================
   */
  bestColors:
    ColorPalette;

  avoidColors:
    ColorPalette;

  bestMetals:
    MetalType[];

  /*
   * ==========================================================
   * NOTE
   * ==========================================================
   */
  notes?:
    string | null;

  createdAt?:
    string;

  updatedAt?:
    string;
}