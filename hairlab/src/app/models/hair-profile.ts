import { HairCondition } from './enums/hair-condition';
import { HairTexture } from './enums/hair-texture';
import { HairType } from './enums/hair-type';
import { PhysicalValue } from './enums/physical-value';
import { Reflection } from './enums/reflection';
import { ToneLevel } from './enums/tone-level';

/**
 * Rappresenta il profilo tecnico dei capelli di un cliente.
 *
 * Il profilo contiene:
 * - caratteristiche cromatiche;
 * - struttura del capello;
 * - stato del capello;
 * - informazioni sulla cute;
 * - storico chimico;
 * - sensibilità;
 * - controindicazioni;
 * - note tecniche.
 */
export interface HairProfile {
  /**
   * Identificativo del profilo.
   *
   * È opzionale perché durante la creazione
   * il database non ha ancora generato l'ID.
   */
  id?: number;

  /**
   * Identificativo del cliente proprietario del profilo.
   */
  customerId: number;

  /**
   * Altezza di tono naturale del cliente.
   */
  naturalTone: ToneLevel;

  /**
   * Altezza di tono attuale dei capelli.
   */
  currentTone: ToneLevel;

  /**
   * Riflesso cromatico principale.
   */
  reflection: Reflection;

  /**
   * Forma naturale del capello:
   * liscio, mosso, riccio o riccio molto stretto.
   */
  hairType: HairType;

  /**
   * Spessore della fibra capillare.
   */
  texture: HairTexture;

  /**
   * Capacità del capello di assorbire
   * e trattenere sostanze e umidità.
   */
  porosity: PhysicalValue;

  /**
   * Quantità di capelli presenti.
   */
  density: PhysicalValue;

  /**
   * Stato generale del capello.
   *
   * Esempi:
   * HEALTHY
   * DRY
   * DAMAGED
   * CHEMICALLY_TREATED
   */
  hairCondition: HairCondition;

  /**
   * Condizioni osservate sulla cute.
   */
  scalpCondition: string[];

  /**
   * Trattamenti chimici eseguiti in passato.
   */
  chemicalHistory: string[];

  /**
   * Sensibilità rilevate sul capello o sulla cute.
   */
  sensitivities: string[];

  /**
   * Eventuali controindicazioni tecniche.
   */
  contraindications: string[];

  /**
   * Note libere del professionista.
   */
  notes?: string;
}