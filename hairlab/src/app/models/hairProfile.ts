import { ToneLevel } from './enums/toneLevel';
import { Reflection } from './enums/reflection';
import { HairType } from './enums/hairType';
import { HairTexture } from './enums/hairTexture';
import { PhysicalValue } from './enums/phisicalValue';
import { HairCondition } from './enums/hairCondition';

export interface HairProfile {

  id?: number;

  customerId: number;

  naturalTone: ToneLevel;
  currentTone: ToneLevel;

  reflection: Reflection;

  hairType: HairType;
  texture: HairTexture;

  porosity: PhysicalValue;
  density: PhysicalValue;

  hairCondition?: HairCondition;

  scalpCondition: string[];

  chemicalHistory: string[];

  sensitivities: string[];

  contraindications: string[];

  notes?: string;
}