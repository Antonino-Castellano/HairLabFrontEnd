import { HairCondition } from '../../../models/enums/hair-condition';
import { HairTexture } from '../../../models/enums/hair-texture';
import { HairType } from '../../../models/enums/hair-type';
import { PhysicalValue } from '../../../models/enums/physical-value';
import { Reflection } from '../../../models/enums/reflection';
import { ToneLevel } from '../../../models/enums/tone-level';

/**
 * Associa ogni ToneLevel alla descrizione italiana
 * che verrà mostrata nell'interfaccia.
 *
 * Il valore reale dell'Enum NON cambia.
 *
 * Esempio:
 * Backend -> LEVEL_5_LIGHT_BROWN
 * Interfaccia -> Castano chiaro
 */
export const TONE_LEVEL_LABELS: Record<ToneLevel, string> = {
  [ToneLevel.LEVEL_1_BLACK]: 'Nero',
  [ToneLevel.LEVEL_2_VERY_DARK_BROWN]: 'Bruno',
  [ToneLevel.LEVEL_3_DARK_BROWN]: 'Castano scuro',
  [ToneLevel.LEVEL_4_MEDIUM_BROWN]: 'Castano medio',
  [ToneLevel.LEVEL_5_LIGHT_BROWN]: 'Castano chiaro',
  [ToneLevel.LEVEL_6_DARK_BLONDE]: 'Biondo scuro',
  [ToneLevel.LEVEL_7_MEDIUM_BLONDE]: 'Biondo medio',
  [ToneLevel.LEVEL_8_LIGHT_BLONDE]: 'Biondo chiaro',
  [ToneLevel.LEVEL_9_VERY_LIGHT_BLONDE]: 'Biondo chiarissimo',
  [ToneLevel.LEVEL_10_LIGHTEST_BLONDE]: 'Biondo platino'
};

/**
 * Colore indicativo utilizzato per rappresentare
 * visivamente l'altezza di tono.
 *
 * Serve esclusivamente all'interfaccia grafica.
 */
export const TONE_LEVEL_COLORS: Record<ToneLevel, string> = {
  [ToneLevel.LEVEL_1_BLACK]: '#171412',
  [ToneLevel.LEVEL_2_VERY_DARK_BROWN]: '#29201b',
  [ToneLevel.LEVEL_3_DARK_BROWN]: '#3d2a20',
  [ToneLevel.LEVEL_4_MEDIUM_BROWN]: '#573a29',
  [ToneLevel.LEVEL_5_LIGHT_BROWN]: '#76503a',
  [ToneLevel.LEVEL_6_DARK_BLONDE]: '#947052',
  [ToneLevel.LEVEL_7_MEDIUM_BLONDE]: '#b18b66',
  [ToneLevel.LEVEL_8_LIGHT_BLONDE]: '#c7a77c',
  [ToneLevel.LEVEL_9_VERY_LIGHT_BLONDE]: '#ddc59a',
  [ToneLevel.LEVEL_10_LIGHTEST_BLONDE]: '#eee0bd'
};

/**
 * Traduzione italiana dei riflessi.
 */
export const REFLECTION_LABELS: Record<Reflection, string> = {
  [Reflection.NATURAL]: 'Naturale',
  [Reflection.ASH]: 'Cenere',
  [Reflection.BLUE]: 'Blu',
  [Reflection.GREEN]: 'Verde',
  [Reflection.GOLD]: 'Dorato',
  [Reflection.COPPER]: 'Rame',
  [Reflection.RED]: 'Rosso',
  [Reflection.RED_VIOLET]: 'Rosso viola',
  [Reflection.MAHOGANY]: 'Mogano',
  [Reflection.VIOLET]: 'Viola',
  [Reflection.BROWN]: 'Marrone',
  [Reflection.MOCHA]: 'Moka',
  [Reflection.BEIGE]: 'Beige',
  [Reflection.PEARL]: 'Perlato',
  [Reflection.CENDRE]: 'Cendré',
  [Reflection.OTHER]: 'Altro'
};

/**
 * Colore indicativo associato ai riflessi.
 */
export const REFLECTION_COLORS: Record<Reflection, string> = {
  [Reflection.NATURAL]: '#8c7157',
  [Reflection.ASH]: '#9a9992',
  [Reflection.BLUE]: '#496783',
  [Reflection.GREEN]: '#66785a',
  [Reflection.GOLD]: '#c49a45',
  [Reflection.COPPER]: '#b96638',
  [Reflection.RED]: '#9b3c36',
  [Reflection.RED_VIOLET]: '#7e3e55',
  [Reflection.MAHOGANY]: '#663f3b',
  [Reflection.VIOLET]: '#66506f',
  [Reflection.BROWN]: '#684838',
  [Reflection.MOCHA]: '#72594d',
  [Reflection.BEIGE]: '#baa589',
  [Reflection.PEARL]: '#d5d0c7',
  [Reflection.CENDRE]: '#aca69c',
  [Reflection.OTHER]: '#b5ada8'
};

export const HAIR_TYPE_LABELS: Record<HairType, string> = {
  [HairType.STRAIGHT]: 'Liscio',
  [HairType.WAVY]: 'Mosso',
  [HairType.CURLY]: 'Riccio',
  [HairType.COILY]: 'Riccio molto stretto'
};

export const HAIR_TEXTURE_LABELS: Record<HairTexture, string> = {
  [HairTexture.FINE]: 'Fine',
  [HairTexture.MEDIUM]: 'Media',
  [HairTexture.COARSE]: 'Grossa'
};

export const PHYSICAL_VALUE_LABELS: Record<PhysicalValue, string> = {
  [PhysicalValue.LOW]: 'Bassa',
  [PhysicalValue.MEDIUM]: 'Media',
  [PhysicalValue.HIGH]: 'Alta'
};

export const HAIR_CONDITION_LABELS: Record<HairCondition, string> = {
  [HairCondition.HEALTHY]: 'Sano',
  [HairCondition.DRY]: 'Secco',
  [HairCondition.DAMAGED]: 'Danneggiato',
  [HairCondition.CHEMICALLY_TREATED]: 'Trattato chimicamente'
};