import { MixingRatio } from './enums/mixing-ratio';
import { Oxygen } from './enums/oxygen';
import { ProductType } from './enums/product-type';
import { Reflection } from './enums/reflection';
import { ToneLevel } from './enums/tone-level';

export interface HairDye {
  id?: number;

  brand: string;
  name: string;
  lineName?: string | null;
  code: string;
  productType: ProductType;

  developerVolume?: Oxygen | null;

  toneLevel?: ToneLevel | null;
  primaryReflection?: Reflection | null;
  secondaryReflection?: Reflection | null;

  defaultMixingRatio?: MixingRatio | null;
  customMixingRatioMultiplier?: number | null;
  allowedDeveloperVolumes?: Oxygen[];
  maxLiftLevels?: number | null;
  depositOnly?: boolean | null;
  technicalNotes?: string | null;

  useLineProfileRules?: boolean;

  active: boolean;
}
