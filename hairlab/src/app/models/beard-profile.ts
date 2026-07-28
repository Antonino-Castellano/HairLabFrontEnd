export type BeardStyle =
  | 'CLEAN_SHAVEN'
  | 'STUBBLE'
  | 'SHORT_BOXED'
  | 'FULL_BEARD'
  | 'LONG_BEARD'
  | 'GOATEE'
  | 'CIRCLE_BEARD'
  | 'VAN_DYKE'
  | 'BALBO'
  | 'ANCHOR'
  | 'CHIN_STRAP'
  | 'DUCKTAIL'
  | 'GARIBALDI'
  | 'MOUSTACHE_ONLY'
  | 'BEARD_AND_MOUSTACHE'
  | 'CUSTOM';
export type BeardLength = 'SHAVED' | 'VERY_SHORT' | 'SHORT' | 'MEDIUM' | 'LONG' | 'VERY_LONG';
export type BeardDensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type BeardGrowthPattern =
  | 'UNIFORM'
  | 'PATCHY_CHEEKS'
  | 'PATCHY_CHIN'
  | 'PATCHY_SIDES'
  | 'STRONG_CHIN'
  | 'STRONG_MOUSTACHE'
  | 'DISCONNECTED_MOUSTACHE'
  | 'IRREGULAR';
export type MoustacheStyle =
  | 'NONE'
  | 'NATURAL'
  | 'SHORT'
  | 'PENCIL'
  | 'CHEVRON'
  | 'HANDLEBAR'
  | 'HORSESHOE'
  | 'WALRUS'
  | 'DISCONNECTED'
  | 'CUSTOM';
export type MoustacheConnection = 'CONNECTED' | 'PARTIALLY_CONNECTED' | 'DISCONNECTED';
export type BeardLine = 'NATURAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DEFINED';
export type SkinSensitivity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type BeardColorGoal =
  | 'NONE'
  | 'FULL_COVERAGE'
  | 'GRAY_BLENDING'
  | 'CAMOUFLAGE'
  | 'DARKENING'
  | 'TONING'
  | 'COLOR_MATCH_WITH_HAIR';

export interface BeardProfile {
  id?: number;
  customerId: number;
  beardPresent: boolean;
  currentStyle?: BeardStyle | null;
  desiredStyle?: BeardStyle | null;
  beardLength?: BeardLength | null;
  approximateLengthMm?: number | null;
  density?: BeardDensity | null;
  growthPattern?: BeardGrowthPattern | null;
  moustachePresent: boolean;
  moustacheStyle?: MoustacheStyle | null;
  moustacheConnection?: MoustacheConnection | null;
  cheekLine?: BeardLine | null;
  neckline?: BeardLine | null;
  skinSensitivity?: SkinSensitivity | null;
  irritationPresent?: boolean | null;
  ingrownHairPresent?: boolean | null;
  dandruffPresent?: boolean | null;
  naturalTone?: string | null;
  grayPercentage?: number | null;
  beardColoringPresent?: boolean | null;
  beardColorHistory?: string | null;
  beardColorGoal?: BeardColorGoal | null;
  contraindications?: string | null;
  notes?: string | null;
}
