import { ProductType } from './enums/productType';
import { ToneLevel } from './enums/toneLevel';
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