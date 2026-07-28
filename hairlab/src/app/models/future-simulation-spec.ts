/** Solo predisposizione dati: nessuna IA è collegata o attiva. */
export interface FutureSimulationSpec {
  aiEnabled: boolean;
  integrationStatus: 'DATA_ONLY' | string;
  haircutCode?: string | null;
  fringeCode?: string | null;
  beardStyleCode?: string | null;
  hairColorCode?: string | null;
  hairColorTechnique?: string | null;
  hairColorPlacement?: string | null;
  beardLengthMm?: number | null;
  technicalAttributes: Record<string, string>;
}
