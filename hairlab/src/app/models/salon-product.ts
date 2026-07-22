/**
 * Servizio presente nel listino HairLab.
 *
 * Non rappresenta necessariamente
 * un prodotto fisico.
 *
 * Esempi:
 *
 * Taglio donna
 * Piega
 * Balayage
 * Colore radice
 * Trattamento ristrutturante
 */
export interface SalonProduct {

  /**
   * Identificativo generato dal database.
   */
  id?: number;

  /**
   * Categoria del servizio.
   */
  productCategoryId: number;

  /**
   * Nome del servizio.
   */
  name: string;

  /**
   * Descrizione del servizio.
   *
   * Il nome corrisponde
   * a SalonProductDto.description.
   */
  description?: string;

  /**
   * Durata prevista in minuti.
   */
  duration: number;

  /**
   * Prezzo base.
   *
   * Attualmente il backend utilizza double.
   * In una fase successiva lo convertiremo
   * in BigDecimal.
   */
  basePrice: number;

  /**
   * Stato del servizio.
   */
  active: boolean;
}