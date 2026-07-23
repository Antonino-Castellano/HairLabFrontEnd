import { InventoryUnit } from '../../models/enums/inventory-unit';
import { ProductType } from '../../models/enums/product-type';
import { Reflection } from '../../models/enums/reflection';
import { ToneLevel } from '../../models/enums/tone-level';

/** Etichette italiane e riferimenti visivi usati nel Color Lab. */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.COLOR]: 'Colorazione',
  [ProductType.TONER]: 'Toner / Gloss',
  [ProductType.BLEACH]: 'Decolorante',
  [ProductType.DEVELOPER]: 'Ossidante / Developer',
  [ProductType.ADDITIVE]: 'Additivo / Correttore',
  [ProductType.TREATMENT]: 'Trattamento'
};

export const INVENTORY_UNIT_LABELS: Record<InventoryUnit, string> = {
  [InventoryUnit.GRAM]: 'g',
  [InventoryUnit.MILLILITER]: 'ml'
};

export const TONE_LEVEL_LABELS: Record<ToneLevel, string> = {
  [ToneLevel.LEVEL_1_BLACK]: '1 · Nero',
  [ToneLevel.LEVEL_2_VERY_DARK_BROWN]: '2 · Bruno',
  [ToneLevel.LEVEL_3_DARK_BROWN]: '3 · Castano scuro',
  [ToneLevel.LEVEL_4_MEDIUM_BROWN]: '4 · Castano medio',
  [ToneLevel.LEVEL_5_LIGHT_BROWN]: '5 · Castano chiaro',
  [ToneLevel.LEVEL_6_DARK_BLONDE]: '6 · Biondo scuro',
  [ToneLevel.LEVEL_7_MEDIUM_BLONDE]: '7 · Biondo medio',
  [ToneLevel.LEVEL_8_LIGHT_BLONDE]: '8 · Biondo chiaro',
  [ToneLevel.LEVEL_9_VERY_LIGHT_BLONDE]: '9 · Biondo chiarissimo',
  [ToneLevel.LEVEL_10_LIGHTEST_BLONDE]: '10 · Biondo platino'
};

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
