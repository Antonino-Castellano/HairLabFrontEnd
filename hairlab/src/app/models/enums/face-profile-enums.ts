/**
 * Enum utilizzati dal profilo morfologico del viso.
 *
 * I valori devono corrispondere esattamente
 * agli Enum Java del backend.
 */

export enum FaceShape {
  OVAL = 'OVAL',
  ROUND = 'ROUND',
  SQUARE = 'SQUARE',
  RECTANGULAR = 'RECTANGULAR',
  OBLONG = 'OBLONG',
  HEART = 'HEART',
  INVERTED_TRIANGLE = 'INVERTED_TRIANGLE',
  TRIANGULAR = 'TRIANGULAR',
  DIAMOND = 'DIAMOND'
}

export enum FaceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum FaceWidth {
  NARROW = 'NARROW',
  MEDIUM = 'MEDIUM',
  WIDE = 'WIDE'
}

export enum FaceLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG'
}

export enum FaceSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

export enum FaceThickness {
  THIN = 'THIN',
  MEDIUM = 'MEDIUM',
  THICK = 'THICK'
}

export enum HairlineShape {
  STRAIGHT = 'STRAIGHT',
  ROUNDED = 'ROUNDED',
  WIDOW_PEAK = 'WIDOW_PEAK',
  M_SHAPED = 'M_SHAPED',
  IRREGULAR = 'IRREGULAR'
}

export enum EyeShape {
  ALMOND = 'ALMOND',
  ROUND = 'ROUND',
  MONOLID = 'MONOLID',
  HOODED = 'HOODED',
  DEEP_SET = 'DEEP_SET',
  PROTRUDING = 'PROTRUDING'
}

export enum EyeOrientation {
  UPTURNED = 'UPTURNED',
  NEUTRAL = 'NEUTRAL',
  DOWNTURNED = 'DOWNTURNED'
}

export enum EyeSpacing {
  CLOSE_SET = 'CLOSE_SET',
  PROPORTIONATE = 'PROPORTIONATE',
  WIDE_SET = 'WIDE_SET'
}

export enum EyeColor {
  VERY_DARK_BROWN = 'VERY_DARK_BROWN',
  DARK_BROWN = 'DARK_BROWN',
  BROWN = 'BROWN',
  LIGHT_BROWN = 'LIGHT_BROWN',
  HAZEL = 'HAZEL',
  AMBER = 'AMBER',
  GREEN = 'GREEN',
  BLUE_GREEN = 'BLUE_GREEN',
  BLUE = 'BLUE',
  GREY = 'GREY',
  GREY_BLUE = 'GREY_BLUE',
  OTHER = 'OTHER'
}

export enum EyebrowShape {
  STRAIGHT = 'STRAIGHT',
  SOFT_ARCH = 'SOFT_ARCH',
  HIGH_ARCH = 'HIGH_ARCH',
  ROUNDED = 'ROUNDED',
  ANGULAR = 'ANGULAR'
}

export enum NoseProfile {
  STRAIGHT = 'STRAIGHT',
  CONVEX = 'CONVEX',
  CONCAVE = 'CONCAVE',
  AQUILINE = 'AQUILINE',
  UPTURNED = 'UPTURNED'
}

export enum NoseTip {
  FINE = 'FINE',
  ROUNDED = 'ROUNDED',
  WIDE = 'WIDE',
  UPTURNED = 'UPTURNED',
  DOWNWARD = 'DOWNWARD'
}

export enum JawShape {
  ROUNDED = 'ROUNDED',
  STRAIGHT = 'STRAIGHT',
  ANGULAR = 'ANGULAR'
}

export enum ChinShape {
  ROUNDED = 'ROUNDED',
  SQUARE = 'SQUARE',
  POINTED = 'POINTED',
  FLAT = 'FLAT'
}

export enum ChinProjection {
  RETRUSIVE = 'RETRUSIVE',
  BALANCED = 'BALANCED',
  PROMINENT = 'PROMINENT'
}

export enum LipFullness {
  THIN = 'THIN',
  MEDIUM = 'MEDIUM',
  FULL = 'FULL'
}

export enum LipBalance {
  BALANCED = 'BALANCED',
  UPPER_FULLER = 'UPPER_FULLER',
  LOWER_FULLER = 'LOWER_FULLER'
}

export enum LipShape {
  BALANCED = 'BALANCED',
  HEART_SHAPED = 'HEART_SHAPED',
  DEFINED_CUPIDS_BOW = 'DEFINED_CUPIDS_BOW',
  ROUNDED = 'ROUNDED',
  WIDE = 'WIDE',
  UPTURNED = 'UPTURNED',
  DOWNTURNED = 'DOWNTURNED'
}