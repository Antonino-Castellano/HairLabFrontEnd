import { ProductType } from './enums/product-type';
import { ToneLevel } from './enums/tone-level';
import { Reflection } from './enums/reflection';

export interface HairDye {

  id?: number;

  brand: string;

  name: string;

  code: string;

  productType: ProductType;

  toneLevel?: ToneLevel;

  primaryReflection?: Reflection;

  secondaryReflection?: Reflection;

  active: boolean;
}