/**
 * Enum utilizzati dall'analisi cromatica.
 *
 * Devono corrispondere ai valori
 * utilizzati dal backend Java.
 */

export enum SkinTone {
  VERY_LIGHT = 'VERY_LIGHT',
  LIGHT = 'LIGHT',
  LIGHT_MEDIUM = 'LIGHT_MEDIUM',
  MEDIUM = 'MEDIUM',
  MEDIUM_DARK = 'MEDIUM_DARK',
  DARK = 'DARK',
  VERY_DARK = 'VERY_DARK'
}

export enum Undertone {
  COOL = 'COOL',
  NEUTRAL_COOL = 'NEUTRAL_COOL',
  NEUTRAL = 'NEUTRAL',
  NEUTRAL_WARM = 'NEUTRAL_WARM',
  WARM = 'WARM',
  OLIVE = 'OLIVE'
}

export enum ColorSeason {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER'
}

export enum ColorSubSeason {
  LIGHT_SPRING = 'LIGHT_SPRING',
  WARM_SPRING = 'WARM_SPRING',
  BRIGHT_SPRING = 'BRIGHT_SPRING',

  LIGHT_SUMMER = 'LIGHT_SUMMER',
  COOL_SUMMER = 'COOL_SUMMER',
  SOFT_SUMMER = 'SOFT_SUMMER',

  SOFT_AUTUMN = 'SOFT_AUTUMN',
  WARM_AUTUMN = 'WARM_AUTUMN',
  DEEP_AUTUMN = 'DEEP_AUTUMN',

  BRIGHT_WINTER = 'BRIGHT_WINTER',
  COOL_WINTER = 'COOL_WINTER',
  DEEP_WINTER = 'DEEP_WINTER'
}

export enum ColorValue {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DEEP = 'DEEP'
}

export enum ContrastLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Chroma {
  SOFT = 'SOFT',
  MEDIUM = 'MEDIUM',
  BRIGHT = 'BRIGHT'
}

export enum MetalType {
  SILVER = 'SILVER',
  WHITE_GOLD = 'WHITE_GOLD',
  YELLOW_GOLD = 'YELLOW_GOLD',
  ROSE_GOLD = 'ROSE_GOLD',
  BRONZE = 'BRONZE',
  COPPER = 'COPPER'
}