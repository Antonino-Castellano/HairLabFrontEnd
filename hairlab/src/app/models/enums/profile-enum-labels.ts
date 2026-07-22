/**
 * Traduzioni visuali degli Enum.
 *
 * Il backend continua a utilizzare
 * valori tecnici inglesi.
 *
 * Il frontend visualizza
 * etichette comprensibili in italiano.
 */

export const PROFILE_ENUM_LABELS:
  Record<string, string> = {

  /*
   * FORMA VISO.
   */
  OVAL: 'Ovale',
  ROUND: 'Rotondo',
  SQUARE: 'Quadrato',
  RECTANGULAR: 'Rettangolare',
  OBLONG: 'Allungato',
  HEART: 'A cuore',
  INVERTED_TRIANGLE:
    'Triangolo inverso',
  TRIANGULAR: 'Triangolare',
  DIAMOND: 'Diamante',

  /*
   * VALORI GENERICI.
   */
  LOW: 'Basso',
  MEDIUM: 'Medio',
  HIGH: 'Alto',

  NARROW: 'Stretto',
  WIDE: 'Ampio',

  SHORT: 'Corto',
  LONG: 'Lungo',

  SMALL: 'Piccolo',
  LARGE: 'Grande',

  THIN: 'Sottile',
  THICK: 'Spesso',

  /*
   * ATTACCATURA.
   */
  STRAIGHT: 'Dritto',
  ROUNDED: 'Arrotondato',
  WIDOW_PEAK:
    'Punta della vedova',
  M_SHAPED: 'Forma a M',
  IRREGULAR: 'Irregolare',

  /*
   * OCCHI.
   */
  ALMOND: 'A mandorla',
  MONOLID: 'Monopalpebra',
  HOODED: 'Incappucciati',
  DEEP_SET: 'Infossati',
  PROTRUDING: 'Prominenti',

  UPTURNED: 'Ascendente',
  NEUTRAL: 'Neutro',
  DOWNTURNED: 'Discendente',

  CLOSE_SET: 'Ravvicinati',
  PROPORTIONATE: 'Proporzionati',
  WIDE_SET: 'Distanziati',

  VERY_DARK_BROWN:
    'Castano molto scuro',

  DARK_BROWN:
    'Castano scuro',

  BROWN:
    'Castano',

  LIGHT_BROWN:
    'Castano chiaro',

  HAZEL:
    'Nocciola',

  AMBER:
    'Ambra',

  GREEN:
    'Verde',

  BLUE_GREEN:
    'Verde-azzurro',

  BLUE:
    'Azzurro',

  GREY:
    'Grigio',

  GREY_BLUE:
    'Grigio-azzurro',

  OTHER:
    'Altro',

  /*
   * SOPRACCIGLIA.
   */
  SOFT_ARCH:
    'Arco morbido',

  HIGH_ARCH:
    'Arco alto',

  ANGULAR:
    'Angolare',

  /*
   * NASO.
   */
  CONVEX:
    'Convesso',

  CONCAVE:
    'Concavo',

  AQUILINE:
    'Aquilinο',

  FINE:
    'Fine',

  DOWNWARD:
    'Verso il basso',

  /*
   * MENTO.
   */
  POINTED:
    'Appuntito',

  FLAT:
    'Piatto',

  RETRUSIVE:
    'Arretrato',

  BALANCED:
    'Proporzionato',

  PROMINENT:
    'Prominente',

  /*
   * LABBRA.
   */
  FULL:
    'Piene',

  UPPER_FULLER:
    'Labbro superiore più pieno',

  LOWER_FULLER:
    'Labbro inferiore più pieno',

  HEART_SHAPED:
    'A cuore',

  DEFINED_CUPIDS_BOW:
    'Arco di Cupido definito',

  /*
   * PELLE.
   */
  VERY_LIGHT:
    'Molto chiara',

  LIGHT:
    'Chiara',

  LIGHT_MEDIUM:
    'Medio-chiara',

  MEDIUM_DARK:
    'Medio-scura',

  DARK:
    'Scura',

  VERY_DARK:
    'Molto scura',

  /*
   * SOTTOTONO.
   */
  COOL:
    'Freddo',

  NEUTRAL_COOL:
    'Neutro-freddo',

  NEUTRAL_WARM:
    'Neutro-caldo',

  WARM:
    'Caldo',

  OLIVE:
    'Oliva',

  /*
   * STAGIONI.
   */
  SPRING:
    'Primavera',

  SUMMER:
    'Estate',

  AUTUMN:
    'Autunno',

  WINTER:
    'Inverno',

  LIGHT_SPRING:
    'Primavera chiara',

  WARM_SPRING:
    'Primavera calda',

  BRIGHT_SPRING:
    'Primavera brillante',

  LIGHT_SUMMER:
    'Estate chiara',

  COOL_SUMMER:
    'Estate fredda',

  SOFT_SUMMER:
    'Estate soft',

  SOFT_AUTUMN:
    'Autunno soft',

  WARM_AUTUMN:
    'Autunno caldo',

  DEEP_AUTUMN:
    'Autunno profondo',

  BRIGHT_WINTER:
    'Inverno brillante',

  COOL_WINTER:
    'Inverno freddo',

  DEEP_WINTER:
    'Inverno profondo',

  /*
   * PROFONDITÀ.
   */
  DEEP:
    'Profondo',

  /*
   * CROMA.
   */
  SOFT:
    'Soft',

  BRIGHT:
    'Brillante',

  /*
   * METALLI.
   */
  SILVER:
    'Argento',

  WHITE_GOLD:
    'Oro bianco',

  YELLOW_GOLD:
    'Oro giallo',

  ROSE_GOLD:
    'Oro rosa',

  BRONZE:
    'Bronzo',

  COPPER:
    'Rame'
};

/**
 * Funzione riutilizzabile.
 *
 * Restituisce la traduzione italiana.
 *
 * Se manca una traduzione,
 * restituisce comunque il valore originale.
 */
export function getProfileEnumLabel(
  value:
    string | null | undefined
): string {

  if (!value) {
    return 'Non specificato';
  }

  return (
    PROFILE_ENUM_LABELS[value] ??
    value
  );
}