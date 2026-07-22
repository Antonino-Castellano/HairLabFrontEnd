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
 * nome colore -> codice HEX.
 *
 * Esempio:
 *
 * {
 *   "Borgogna": "#6D213C",
 *   "Blu notte": "#172A46"
 * }
 */
export type ColorPalette = Record<
  string,
  string
>;

/**
 * Rappresenta l'analisi cromatica
 * della cliente.
 */
export interface ColorAnalysis {

  id?: number;

  customerId: number;

  skinTone?: SkinTone | null;

  undertone?: Undertone | null;

  season?: ColorSeason | null;

  subSeason?: ColorSubSeason | null;

  colorValue?: ColorValue | null;

  contrastLevel?: ContrastLevel | null;

  chroma?: Chroma | null;

  bestColors: ColorPalette;

  avoidColors: ColorPalette;

  bestMetals: MetalType[];

  notes?: string | null;

  createdAt?: string;

  updatedAt?: string;
}