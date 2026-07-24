import { MixingRatio } from './enums/mixing-ratio';
import { Oxygen } from './enums/oxygen';

export interface ColorProductLineProfile {
  id?: number;

  brand: string;
  lineName: string;

  defaultMixingRatio?: MixingRatio | null;
  customMixingRatioMultiplier?: number | null;

  allowedDeveloperVolumes: Oxygen[];

  maxLiftLevels?: number | null;
  depositOnly?: boolean | null;

  allowCrossLineMixing: boolean;
  requireSameLineDeveloper: boolean;

  technicalNotes?: string | null;

  active: boolean;
}
