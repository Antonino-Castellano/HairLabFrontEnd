import {
  ChinProjection,
  ChinShape,
  EyeColor,
  EyeOrientation,
  EyeShape,
  EyeSpacing,
  EyebrowShape,
  FaceLength,
  FaceLevel,
  FaceShape,
  FaceSize,
  FaceThickness,
  FaceWidth,
  HairlineShape,
  JawShape,
  LipBalance,
  LipFullness,
  LipShape,
  NoseProfile,
  NoseTip
} from './enums/face-profile-enums';

/**
 * Profilo morfologico del viso.
 *
 * Corrisponde a FaceProfileDto
 * del backend.
 */
export interface FaceProfile {

  id?: number;

  customerId: number;

  /*
   * ==========================================================
   * FORMA GENERALE
   * ==========================================================
   */
  faceShape?:
    FaceShape | null;

  /*
   * ==========================================================
   * FRONTE
   * ==========================================================
   */
  foreheadHeight?:
    FaceLevel | null;

  foreheadWidth?:
    FaceWidth | null;

  hairlineShape?:
    HairlineShape | null;

  /*
   * ==========================================================
   * OCCHI
   * ==========================================================
   */
  eyeShape?:
    EyeShape | null;

  eyeOrientation?:
    EyeOrientation | null;

  eyeSpacing?:
    EyeSpacing | null;

  eyeSize?:
    FaceSize | null;

  /**
   * Classificazione generale.
   *
   * Esempio:
   *
   * HAZEL
   * DARK_BROWN
   */
  eyeColor?:
    EyeColor | null;

  /**
   * Colore HEX reale utilizzato
   * come riferimento visivo.
   *
   * Esempio:
   *
   * #80603E
   */
  eyeReferenceColor?:
    string | null;

  eyeColorNotes?:
    string | null;

  /*
   * ==========================================================
   * SOPRACCIGLIA
   * ==========================================================
   */
  eyebrowShape?:
    EyebrowShape | null;

  eyebrowThickness?:
    FaceThickness | null;

  /*
   * ==========================================================
   * NASO
   * ==========================================================
   */
  noseLength?:
    FaceLength | null;

  noseWidth?:
    FaceWidth | null;

  noseProfile?:
    NoseProfile | null;

  noseTip?:
    NoseTip | null;

  /*
   * ==========================================================
   * ZIGOMI
   * ==========================================================
   */
  cheekboneWidth?:
    FaceWidth | null;

  cheekboneProminence?:
    FaceLevel | null;

  /*
   * ==========================================================
   * MASCELLA
   * ==========================================================
   */
  jawWidth?:
    FaceWidth | null;

  jawDefinition?:
    FaceLevel | null;

  jawShape?:
    JawShape | null;

  /*
   * ==========================================================
   * MENTO
   * ==========================================================
   */
  chinShape?:
    ChinShape | null;

  chinProjection?:
    ChinProjection | null;

  /*
   * ==========================================================
   * BOCCA E LABBRA
   * ==========================================================
   */
  mouthWidth?:
    FaceWidth | null;

  lipFullness?:
    LipFullness | null;

  lipBalance?:
    LipBalance | null;

  lipShape?:
    LipShape | null;

  /*
   * ==========================================================
   * NOTE
   * ==========================================================
   */
  notes?:
    string | null;

  stylingGoals?:
    string | null;

  createdAt?:
    string;

  updatedAt?:
    string;
}