import { PROFILE_ENUM_LABELS } from '../../models/enums/profile-enum-labels';

/**
 * Dizionario visuale centralizzato HairLab.
 *
 * I valori tecnici scambiati con Spring restano invariati in inglese.
 * Questa mappa riguarda esclusivamente la rappresentazione grafica italiana.
 */
export const HAIRLAB_TECHNICAL_LABELS: Record<string, string> = {
  ...PROFILE_ENUM_LABELS,

  // Identità, ruoli e categorie.
  FEMALE: 'Donna',
  MALE: 'Uomo',
  SUPERADMIN: 'Super amministratore',
  ADMIN: 'Amministratore',
  CUSTOMER: 'Cliente',
  RECEPTIONIST: 'Addetto alla reception',
  USER: 'Utente',
  HAIRCUT: 'Taglio',
  FRINGE: 'Frangia',
  COLOR: 'Colore',
  BEARD: 'Barba e baffi',
  TOTAL_LOOK: 'Total Look',
  STYLING: 'Piega e acconciatura',

  // Stati suggerimenti e formule.
  PROPOSED: 'In valutazione',
  ACCEPTED: 'Accettato',
  REJECTED: 'Rifiutato',
  MODIFIED: 'Accettato con modifiche',
  DRAFT: 'Bozza',
  USED: 'Utilizzata',
  ARCHIVED: 'Archiviata',
  ACTIVE: 'Attivo',
  INACTIVE: 'Disattivato',

  // Appuntamenti.
  BOOKED: 'Prenotato',
  CONFIRMED: 'Confermato',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completato',
  CANCELLED: 'Annullato',
  NO_SHOW: 'Cliente assente',

  // Famiglie taglio.
  BUZZ_CROP: 'Buzz cut e crop',
  PIXIE: 'Pixie',
  BIXIE: 'Bixie e pixie bob',
  BOB: 'Bob',
  LOB: 'Lob',
  SHAG: 'Shag',
  WOLF_CUT: 'Wolf cut',
  MULLET: 'Mullet',
  CURLY_NATURAL: 'Ricci e naturali',
  CLASSIC_MENS: 'Tagli uomo classici',
  MODERN_MENS: 'Tagli uomo moderni',
  LONG_MENS: 'Tagli uomo medi e lunghi',

  // Lunghezze e forme.
  BUZZED: 'Rasato',
  VERY_SHORT: 'Molto corto',
  SHORT: 'Corto',
  MEDIUM: 'Medio',
  LONG: 'Lungo',
  VERY_LONG: 'Molto lungo',
  COMPACT: 'Compatta',
  SOFT_ROUNDED: 'Morbida e arrotondata',
  ROUNDED: 'Arrotondata',
  OVAL: 'Ovale',
  BALANCED: 'Bilanciata',
  VERTICAL: 'Sviluppo verticale',
  HORIZONTAL: 'Sviluppo orizzontale',
  ANGULAR: 'Angolare',
  TOP_HEAVY: 'Volume concentrato sulla sommità',
  TAPERED: 'Affusolata',
  FULL: 'Piena',
  ELONGATED: 'Allungata',
  ASYMMETRIC: 'Asimmetrica',

  // Strutture e perimetri.
  BLUNT: 'Pari e compatta',
  UNIFORM: 'Uniforme',
  SOFT_GRADUATED: 'Graduazione morbida',
  GRADUATED: 'Graduato',
  STACKED: 'Graduazione sovrapposta',
  LAYERED: 'Scalato',
  LONG_LAYERS: 'Scalature lunghe',
  INTERNAL_LAYERS: 'Scalature interne',
  DISCONNECTED: 'Disconnesso',
  TEXTURED: 'Texturizzato',
  CHOPPY: 'Scalatura spezzata',
  FEATHERED: 'Scalatura piumata',
  RAZOR: 'Lavorazione a rasoio',
  NATURAL: 'Naturale',
  U_SHAPE: 'Perimetro a U',
  V_SHAPE: 'Perimetro a V',
  A_LINE: 'Linea ad A',
  CONCAVE: 'Concavo',
  CONVEX: 'Convesso',

  // Frange.
  NONE: 'Nessuna',
  MICRO: 'Micro frangia',
  BABY: 'Frangia molto corta',
  SHORT_STRAIGHT: 'Corta e dritta',
  SOFT_FULL: 'Piena morbida',
  WISPY: 'Wispy bangs · leggera e sfilata',
  AIRY: 'Airy bangs · molto leggera',
  BOTTLENECK: 'Bottleneck bangs',
  CURTAIN: 'Curtain bangs',
  LONG_CURTAIN: 'Curtain bangs lunghe',
  SIDE_SWEPT: 'Side-swept bangs',
  LONG_SIDE: 'Laterale lunga',
  DIAGONAL: 'Diagonale',
  FACE_FRAMING: 'Face framing',

  // Nuca, sfumature e orecchie.
  SOFT_TAPERED: 'Sfumata morbida',
  SQUARED: 'Squadrata',
  SHORT_DEFINED: 'Corta e definita',
  SHAVED: 'Rasata',
  TAPER: 'Taper',
  LOW_TAPER: 'Low taper',
  LOW_FADE: 'Low fade',
  MID_FADE: 'Mid fade',
  HIGH_FADE: 'High fade',
  SKIN_FADE: 'Skin fade',
  COVERED: 'Orecchie coperte',
  PARTIALLY_EXPOSED: 'Orecchie parzialmente scoperte',
  EXPOSED: 'Orecchie scoperte',

  // Capello.
  WAVY: 'Mosso',
  CURLY: 'Riccio',
  COILY: 'Riccio molto stretto',
  FINE: 'Fine',
  COARSE: 'Grosso',
  HEALTHY: 'Sano',
  DRY: 'Secco',
  DAMAGED: 'Danneggiato',
  CHEMICALLY_TREATED: 'Trattato chimicamente',

  // Forme viso e valori fisici aggiuntivi.
  ROUND: 'Rotondo',
  SQUARE: 'Quadrato',
  RECTANGULAR: 'Rettangolare',
  OBLONG: 'Allungato',
  HEART: 'A cuore',
  INVERTED_TRIANGLE: 'Triangolo rovesciato',
  TRIANGULAR: 'Triangolare',
  DIAMOND: 'A diamante',
  VERY_HIGH: 'Molto alta',

  // Barba e baffi.
  CLEAN_SHAVEN: 'Rasatura completa',
  STUBBLE: 'Barba di pochi giorni',
  SHORT_BOXED: 'Barba corta definita',
  FULL_BEARD: 'Barba piena',
  LONG_BEARD: 'Barba lunga',
  GOATEE: 'Pizzetto',
  CIRCLE_BEARD: 'Barba circolare',
  VAN_DYKE: 'Van Dyke',
  BALBO: 'Balbo',
  ANCHOR: 'Barba ad ancora',
  CHIN_STRAP: 'Fascia mandibolare',
  DUCKTAIL: 'Barba a coda d’anatra',
  GARIBALDI: 'Garibaldi',
  MOUSTACHE_ONLY: 'Solo baffi',
  BEARD_AND_MOUSTACHE: 'Barba e baffi',
  CUSTOM: 'Personalizzato',
  PENCIL: 'Baffo sottile',
  CHEVRON: 'Baffo pieno a gallone',
  HANDLEBAR: 'Baffo a manubrio',
  HORSESHOE: 'Baffo a ferro di cavallo',
  WALRUS: 'Baffo folto e ricadente',
  CONNECTED: 'Collegati',
  PARTIALLY_CONNECTED: 'Parzialmente collegati',
  DEFINED: 'Definita',
  PATCHY_CHEEKS: 'Rada sulle guance',
  PATCHY_CHIN: 'Rada sul mento',
  PATCHY_SIDES: 'Rada ai lati',
  STRONG_CHIN: 'Forte sul mento',
  STRONG_MOUSTACHE: 'Forte sui baffi',
  DISCONNECTED_MOUSTACHE: 'Baffi separati dalla barba',
  IRREGULAR: 'Irregolare',
  FULL_COVERAGE: 'Copertura completa',
  GRAY_BLENDING: 'Grey blending',
  CAMOUFLAGE: 'Camouflage',
  DARKENING: 'Scurimento',
  TONING: 'Tonalizzazione',

  // Colore.
  ROOT_REGROWTH: 'Ricrescita',
  FULL_HEAD: 'Applicazione completa',
  LENGTHS_AND_ENDS: 'Lunghezze e punte',
  PARTIAL: 'Applicazione parziale',
  HIGHLIGHTS: 'Highlights',
  NATURAL_REFLECTION: 'Naturale',
  ASH: 'Cenere',
  GOLD: 'Dorato',
  RED: 'Rosso',
  RED_VIOLET: 'Rosso violaceo',
  MAHOGANY: 'Mogano',
  VIOLET: 'Viola',
  BROWN: 'Marrone',
  MOCHA: 'Moka',
  BEIGE: 'Beige',
  PEARL: 'Perlato',
  CENDRE: 'Cenere freddo',
  LEVEL_1_BLACK: 'Livello 1 · Nero',
  LEVEL_2_VERY_DARK_BROWN: 'Livello 2 · Castano nerissimo',
  LEVEL_3_DARK_BROWN: 'Livello 3 · Castano scuro',
  LEVEL_4_MEDIUM_BROWN: 'Livello 4 · Castano medio',
  LEVEL_5_LIGHT_BROWN: 'Livello 5 · Castano chiaro',
  LEVEL_6_DARK_BLONDE: 'Livello 6 · Biondo scuro',
  LEVEL_7_MEDIUM_BLONDE: 'Livello 7 · Biondo medio',
  LEVEL_8_LIGHT_BLONDE: 'Livello 8 · Biondo chiaro',
  LEVEL_9_VERY_LIGHT_BLONDE: 'Livello 9 · Biondo chiarissimo',
  LEVEL_10_LIGHTEST_BLONDE: 'Livello 10 · Biondo chiarissimo extra',

  // Fattibilità e strategie colore.
  FEASIBLE: 'Realizzabile',
  FEASIBLE_WITH_LIMITATIONS: 'Realizzabile con limitazioni',
  NOT_FEASIBLE: 'Non realizzabile',
  DIRECT_OR_LOW_COMPLEXITY: 'Intervento diretto o poco complesso',
  CONTROLLED_LIFT: 'Schiaritura controllata',
  PRELIGHTENING_LIKELY: 'Probabile pre-schiaritura',
  DARKENING_FILL_LIKELY: 'Probabile ripigmentazione prima dello scurimento',
  DEPOSIT_OR_TONE: 'Deposito di pigmento o tonalizzazione',
  CONTROLLED_LIFT_AND_DEPOSIT: 'Schiaritura controllata e deposito',
  PRELIGHTEN_THEN_TONE: 'Pre-schiaritura e successiva tonalizzazione',
  DARKEN_AND_DEPOSIT: 'Scurimento e deposito',
  PREPIGMENT_THEN_DARKEN: 'Ripigmentazione e scurimento',

  // Protocollo colore.
  DIAGNOSIS: 'Diagnosi',
  COLOR_REMOVAL: 'Rimozione del colore',
  PRELIGHTENING: 'Pre-schiaritura',
  PREPIGMENTATION: 'Ripigmentazione',
  ROOT_APPLICATION: 'Applicazione in radice',
  LENGTHS_APPLICATION: 'Applicazione sulle lunghezze',
  GLOSS: 'Gloss',
  REEVALUATION: 'Rivalutazione',
  TREATMENT: 'Trattamento',
  ROOTS: 'Radici',
  LENGTHS: 'Lunghezze',
  ENDS: 'Punte',
  HAIRLINE: 'Attaccatura',

  // Rapporti, ossigeni e unità.
  RATIO_1_TO_1: 'Rapporto 1:1',
  RATIO_1_TO_1_5: 'Rapporto 1:1,5',
  RATIO_1_TO_2: 'Rapporto 1:2',
  RATIO_1_TO_3: 'Rapporto 1:3',
  VOL_6: '6 volumi',
  VOL_9: '9 volumi',
  VOL_10: '10 volumi',
  VOL_12: '12 volumi',
  VOL_20: '20 volumi',
  VOL_30: '30 volumi',
  VOL_40: '40 volumi',
  GRAM: 'Grammi',
  MILLILITER: 'Millilitri',

  // Prodotti.
  ADDITIVE: 'Additivo',
  BLEACH: 'Decolorante',
  DEVELOPER: 'Ossidante',
  TONER: 'Toner',

  // Consulenze.
  HAIR_CUT: 'Taglio',
  HAIR_COLOR: 'Colore',
  HAIR_STYLING: 'Piega e acconciatura',
  SCALP_TREATMENT: 'Trattamento cute',
  HAIR_RESTORATION: 'Ricostruzione del capello',
  HAIR_EXTENSION: 'Extension',
  HAIR_STRAIGHTENING: 'Stiratura',
  HAIR_PERMING: 'Permanente',
  HAIR_REPAIR: 'Riparazione del capello',
  HAIR_ANALYSIS: 'Analisi del capello',

  // Ruoli professionali e specializzazioni.
  SALON_MANAGER: 'Responsabile salone',
  HAIR_STYLIST: 'Parrucchiere',
  COLORIST: 'Colorista',
  BARBER: 'Barbiere',
  ASSISTANT: 'Assistente',
  WOMENS_CUT: 'Taglio donna',
  MENS_CUT: 'Taglio uomo',
  PIXIE_CUT: 'Taglio pixie',
  BOB_CUT: 'Taglio bob',
  CURLY_HAIR_CUT: 'Taglio capelli ricci',
  BLOW_DRY: 'Piega',
  UPDO: 'Raccolto',
  BALAYAGE: 'Balayage',
  COLOR_CORRECTION: 'Correzione colore',
  CREATIVE_COLOR: 'Colore creativo',
  BLEACHING: 'Decolorazione',
  HAIR_TREATMENTS: 'Trattamenti capelli',
  SCALP_TREATMENTS: 'Trattamenti cute',
  BEARD_GROOMING: 'Cura e definizione barba',
  SHAVING: 'Rasatura',

  // Origini e movimentazioni.
  MANUAL: 'Manuale',
  SMART_FORMULA: 'Smart Formula',
  REVISION: 'Revisione',
  RECURRING: 'Ricorrente',
  INITIAL_STOCK: 'Giacenza iniziale',
  STOCK_IN: 'Carico magazzino',
  STOCK_OUT: 'Scarico magazzino',
  FORMULA_USAGE: 'Utilizzo formula',
  RETURN_IN: 'Reso in ingresso',
  ADJUSTMENT_IN: 'Rettifica positiva',
  ADJUSTMENT_OUT: 'Rettifica negativa',
  INVENTORY_COUNT: 'Inventario fisico',

  // Ordini e risultati.
  ORDERED: 'Ordinato',
  PARTIALLY_RECEIVED: 'Ricevuto parzialmente',
  RECEIVED: 'Ricevuto',
  OUT_OF_STOCK: 'Esaurito',
  EXCELLENT: 'Eccellente',
  GOOD: 'Buono',
  INFO: 'Informazione',
  CAUTION: 'Attenzione',

  // Predisposizione futura.
  TARGET_MATCH: 'Corrispondenza al risultato desiderato',
  TARGET_BASE: 'Base del risultato desiderato',
  PRIMARY_REFLECTION_SUPPORT: 'Supporto al riflesso principale',
  SECONDARY_REFLECTION_SUPPORT: 'Supporto al riflesso secondario',
  WHITE_HAIR_COVERAGE_BASE: 'Base per copertura dei capelli bianchi',
  SOFT: 'Soft',
  OTHER: 'Altro',
  FORMULA_BUILDER: 'Formula Builder',
  HIGHLIGHT: 'Highlight',
  BABYLIGHTS: 'Babylights',
  LOWLIGHTS: 'Lowlights',
  PLACEMENT: 'Placement',
  UNDERCUT: 'Undercut',
  ROOT_SHADOW: 'Root shadow',
  ROOT_MELT: 'Root melt',
  COLOR_BLOCKING: 'Color blocking',
  MONEY_PIECE: 'Money piece',
  GREY_BLENDING: 'Grey blending',
  PROFESSIONAL_REVIEW_REQUIRED: 'Valutazione professionale necessaria',
  PROFESSIONAL_ASSESSMENT: 'Valutazione professionale',
  CORRECTIVE_SUPPORT: 'Supporto correttivo',
  WARNING: 'Avviso',
  LOW_STOCK: 'Scorta bassa',
  CORRECTION_REQUIRED: 'Correzione necessaria',
  ADJUSTMENT: 'Rettifica',
  COPPER: 'Rame',
  DATA_ONLY: 'Solo predisposizione dati',
};

const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  // I termini professionali ormai acquisiti in italiano restano invariati:
  // Smart Formula, Formula Builder, Total Look, highlight, bob, pixie,
  // balayage, fade, undercut, gloss, face framing, grey blending, ecc.
  [/\bfull head\b/gi, 'applicazione completa'],
  [/\btextured\b/gi, 'texturizzato'],
  [/\blayered\b/gi, 'scalato'],
  [/\bchoppy\b/gi, 'destrutturato'],
  [/\bfeathered\b/gi, 'piumato'],
  [/\bcurly\b/gi, 'riccio'],
  [/\bwavy\b/gi, 'mosso'],
  [/\bstraight\b/gi, 'liscio'],
  [/\bshort\b/gi, 'corto'],
  [/\bmedium\b/gi, 'medio'],
  [/\blong\b/gi, 'lungo'],
];

export function hairLabTechnicalLabel(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Non specificato';
  if (typeof value === 'boolean') return value ? 'Sì' : 'No';

  const raw = String(value).trim();
  if (!raw) return 'Non specificato';

  const direct = HAIRLAB_TECHNICAL_LABELS[raw];
  if (direct) return direct;

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_');
  const normalizedLabel = HAIRLAB_TECHNICAL_LABELS[normalized];
  if (normalizedLabel) return normalizedLabel;

  return humanizeTechnicalValue(raw);
}

export function hairLabTechnicalText(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Non specificato';

  const raw = String(value).trim();
  if (!raw) return 'Non specificato';

  if (/^[A-Z0-9_]+$/.test(raw)) {
    return hairLabTechnicalLabel(raw);
  }

  let translated = raw;

  const enumTokens = Object.keys(HAIRLAB_TECHNICAL_LABELS).sort((a, b) => b.length - a.length);

  for (const token of enumTokens) {
    translated = translated.replace(
      new RegExp(`\\b${escapeRegExp(token)}\\b`, 'g'),
      HAIRLAB_TECHNICAL_LABELS[token],
    );
  }

  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    translated = translated.replace(pattern, replacement);
  }

  return translated.replace(/\s{2,}/g, ' ').trim();
}

export function hairLabCatalogName(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Senza nome';

  const raw = String(value).trim();
  const exact: Record<string, string> = {
    'Classic pixie': 'Pixie classico',
    'Soft pixie': 'Soft pixie',
    'Long pixie': 'Long pixie',
    'Textured pixie': 'Pixie texturizzato',
    'Undercut pixie': 'Undercut pixie',
    'Hidden undercut pixie': 'Hidden undercut pixie',
    'Classic bob': 'Bob classico',
    'French bob': 'French bob',
    'Soft bob': 'Soft bob',
    'Textured bob': 'Bob texturizzato',
    'Classic lob': 'Lob classico',
    'Soft lob': 'Soft lob',
    'Classic shag': 'Shag classico',
    'Soft shag': 'Soft shag',
    'Classic wolf cut': 'Wolf cut classico',
    'Soft wolf cut': 'Soft wolf cut',
    'Classic female mullet': 'Mullet femminile classico',
    'Textured crop': 'Crop texturizzato',
    'French crop': 'French crop',
    'Side part classico': 'Riga laterale classica',
    'Classic bixie': 'Bixie classico',
    'Soft bixie': 'Soft bixie',
  };

  if (exact[raw]) return exact[raw];
  return hairLabTechnicalText(raw);
}

function humanizeTechnicalValue(value: string): string {
  const words = value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const translated = HAIRLAB_TECHNICAL_LABELS[word.toUpperCase()];
      return translated ? translated.toLowerCase() : word;
    });

  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
