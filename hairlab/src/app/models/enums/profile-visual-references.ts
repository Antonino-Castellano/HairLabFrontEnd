/**
 * Informazioni visuali utilizzate
 * nei form FaceProfile e ColorAnalysis.
 *
 * Gli Enum rimangono i valori tecnici.
 *
 * Questo file contiene esclusivamente
 * la rappresentazione visuale:
 *
 * - simboli;
 * - descrizioni;
 * - colori di riferimento.
 */
export interface ProfileVisualReference {

  /**
   * Simbolo schematico.
   */
  symbol: string;

  /**
   * Breve spiegazione visuale.
   */
  description: string;

  /**
   * Colore indicativo opzionale.
   */
  color?: string;
}

/*
 * ============================================================
 * TONALITÀ PELLE
 * ============================================================
 *
 * Sono riferimenti visuali iniziali.
 *
 * NON rappresentano un'identificazione scientifica
 * o una corrispondenza universale.
 *
 * Il professionista potrà modificare
 * il vero skinReferenceColor della cliente.
 */
export const SKIN_TONE_VISUALS:
  Record<string, ProfileVisualReference> = {

  VERY_LIGHT: {
    symbol: '●',
    description: 'Profondità molto chiara',
    color: '#F4D8C8'
  },

  LIGHT: {
    symbol: '●',
    description: 'Profondità chiara',
    color: '#EBC2AA'
  },

  LIGHT_MEDIUM: {
    symbol: '●',
    description: 'Profondità medio-chiara',
    color: '#D9A17F'
  },

  MEDIUM: {
    symbol: '●',
    description: 'Profondità media',
    color: '#BC7D5E'
  },

  MEDIUM_DARK: {
    symbol: '●',
    description: 'Profondità medio-scura',
    color: '#986249'
  },

  DARK: {
    symbol: '●',
    description: 'Profondità scura',
    color: '#704735'
  },

  VERY_DARK: {
    symbol: '●',
    description: 'Profondità molto scura',
    color: '#4A3028'
  }
};

/*
 * ============================================================
 * FORMA VISO
 * ============================================================
 */
export const FACE_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  OVAL: {
    symbol: '⬭',
    description: 'Proporzioni morbide ed equilibrate'
  },

  ROUND: {
    symbol: '◯',
    description: 'Lunghezza e larghezza simili'
  },

  SQUARE: {
    symbol: '□',
    description: 'Linee definite e mandibola ampia'
  },

  RECTANGULAR: {
    symbol: '▯',
    description: 'Struttura definita e verticale'
  },

  OBLONG: {
    symbol: '⬯',
    description: 'Sviluppo prevalentemente verticale'
  },

  HEART: {
    symbol: '♡',
    description: 'Parte superiore più ampia e mento sottile'
  },

  INVERTED_TRIANGLE: {
    symbol: '▽',
    description: 'Fronte ampia e parte inferiore stretta'
  },

  TRIANGULAR: {
    symbol: '△',
    description: 'Mandibola più ampia della fronte'
  },

  DIAMOND: {
    symbol: '◇',
    description: 'Zigomi predominanti'
  }
};

/*
 * ============================================================
 * FORMA OCCHI
 * ============================================================
 */
export const EYE_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  ALMOND: {
    symbol: '◠ ◠',
    description: 'Forma allungata e affusolata'
  },

  ROUND: {
    symbol: '○ ○',
    description: 'Apertura più ampia e circolare'
  },

  MONOLID: {
    symbol: '━ ━',
    description: 'Piega palpebrale poco evidente'
  },

  HOODED: {
    symbol: '⌒ ⌒',
    description: 'Palpebra mobile parzialmente coperta'
  },

  DEEP_SET: {
    symbol: '◉ ◉',
    description: 'Occhi visivamente più profondi'
  },

  PROTRUDING: {
    symbol: '⊙ ⊙',
    description: 'Occhi più proiettati in avanti'
  }
};

/*
 * ============================================================
 * ORIENTAMENTO OCCHI
 * ============================================================
 */
export const EYE_ORIENTATION_VISUALS:
  Record<string, ProfileVisualReference> = {

  UPTURNED: {
    symbol: '↗  ↖',
    description: 'Angolo esterno leggermente ascendente'
  },

  NEUTRAL: {
    symbol: '—  —',
    description: 'Asse prevalentemente orizzontale'
  },

  DOWNTURNED: {
    symbol: '↘  ↙',
    description: 'Angolo esterno leggermente discendente'
  }
};

/*
 * ============================================================
 * COLORE OCCHI
 * ============================================================
 */
export const EYE_COLOR_VISUALS:
  Record<string, ProfileVisualReference> = {

  VERY_DARK_BROWN: {
    symbol: '●',
    description: 'Castano molto scuro',
    color: '#2A1A14'
  },

  DARK_BROWN: {
    symbol: '●',
    description: 'Castano scuro',
    color: '#4A2C22'
  },

  BROWN: {
    symbol: '●',
    description: 'Castano medio',
    color: '#6A4634'
  },

  LIGHT_BROWN: {
    symbol: '●',
    description: 'Castano chiaro',
    color: '#9A6A4A'
  },

  HAZEL: {
    symbol: '●',
    description: 'Nocciola con possibili variazioni verdi/dorate',
    color: '#88703F'
  },

  AMBER: {
    symbol: '●',
    description: 'Ambra caldo',
    color: '#B7791F'
  },

  GREEN: {
    symbol: '●',
    description: 'Verde',
    color: '#5F7D5B'
  },

  BLUE_GREEN: {
    symbol: '●',
    description: 'Verde-azzurro',
    color: '#4F7C78'
  },

  BLUE: {
    symbol: '●',
    description: 'Azzurro',
    color: '#5F86A6'
  },

  GREY: {
    symbol: '●',
    description: 'Grigio',
    color: '#858A8F'
  },

  GREY_BLUE: {
    symbol: '●',
    description: 'Grigio-azzurro',
    color: '#71859A'
  },

  OTHER: {
    symbol: '●',
    description: 'Colore personalizzato',
    color: '#B8AAA2'
  }
};

/*
 * ============================================================
 * SOPRACCIGLIA
 * ============================================================
 */
export const EYEBROW_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  STRAIGHT: {
    symbol: '━━━━',
    description: 'Linea prevalentemente orizzontale'
  },

  SOFT_ARCH: {
    symbol: '╭──╮',
    description: 'Arco leggero e morbido'
  },

  HIGH_ARCH: {
    symbol: '╱╲',
    description: 'Punto di arco più pronunciato'
  },

  ROUNDED: {
    symbol: '⌒',
    description: 'Curvatura uniforme'
  },

  ANGULAR: {
    symbol: '╱￣╲',
    description: 'Forma più geometrica e definita'
  }
};

/*
 * ============================================================
 * PROFILO NASO
 * ============================================================
 */
export const NOSE_PROFILE_VISUALS:
  Record<string, ProfileVisualReference> = {

  STRAIGHT: {
    symbol: '│',
    description: 'Dorso prevalentemente rettilineo'
  },

  CONVEX: {
    symbol: ')',
    description: 'Dorso leggermente convesso'
  },

  CONCAVE: {
    symbol: '(',
    description: 'Dorso leggermente concavo'
  },

  AQUILINE: {
    symbol: '⌐',
    description: 'Profilo più marcato'
  },

  UPTURNED: {
    symbol: '╯',
    description: 'Punta orientata leggermente verso l’alto'
  }
};

/*
 * ============================================================
 * MASCELLA
 * ============================================================
 */
export const JAW_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  ROUNDED: {
    symbol: '∪',
    description: 'Linea mandibolare morbida'
  },

  STRAIGHT: {
    symbol: '└─┘',
    description: 'Linea inferiore più lineare'
  },

  ANGULAR: {
    symbol: '⌞⌟',
    description: 'Angoli mandibolari più definiti'
  }
};

/*
 * ============================================================
 * MENTO
 * ============================================================
 */
export const CHIN_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  ROUNDED: {
    symbol: '∪',
    description: 'Terminazione morbida e arrotondata'
  },

  SQUARE: {
    symbol: '▱',
    description: 'Base più ampia e definita'
  },

  POINTED: {
    symbol: '∨',
    description: 'Terminazione più appuntita'
  },

  FLAT: {
    symbol: '⊔',
    description: 'Terminazione inferiore più piatta'
  }
};

/*
 * ============================================================
 * LABBRA
 * ============================================================
 */
export const LIP_SHAPE_VISUALS:
  Record<string, ProfileVisualReference> = {

  BALANCED: {
    symbol: '≈',
    description: 'Proporzioni equilibrate'
  },

  HEART_SHAPED: {
    symbol: '♡',
    description: 'Disegno centrale più evidente'
  },

  DEFINED_CUPIDS_BOW: {
    symbol: '⌄⌄',
    description: 'Arco di Cupido ben definito'
  },

  ROUNDED: {
    symbol: '◡',
    description: 'Contorno morbido e arrotondato'
  },

  WIDE: {
    symbol: '━━',
    description: 'Sviluppo prevalentemente orizzontale'
  },

  UPTURNED: {
    symbol: '⌣',
    description: 'Commissure leggermente ascendenti'
  },

  DOWNTURNED: {
    symbol: '⌢',
    description: 'Commissure leggermente discendenti'
  }
};

/**
 * Restituisce in sicurezza
 * il riferimento visuale.
 */
export function getVisualReference(
  collection:
    Record<
      string,
      ProfileVisualReference
    >,
  value:
    string |
    null |
    undefined
): ProfileVisualReference {

  if (
    !value ||
    !collection[value]
  ) {

    return {
      symbol: '•',
      description:
        'Nessun riferimento disponibile'
    };
  }

  return collection[value];
}