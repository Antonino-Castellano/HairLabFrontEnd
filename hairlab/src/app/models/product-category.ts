/**
 * Categoria dei servizi/prodotti
 * presenti nel listino HairLab.
 *
 * Esempi:
 *
 * TAGLIO
 * COLORE
 * STYLING
 * TRATTAMENTI
 */
export interface ProductCategory {

  /**
   * Identificativo generato dal database.
   */
  id?: number;

  /**
   * Nome della categoria.
   */
  name: string;

  /**
   * Descrizione della categoria.
   *
   * Il nome deve essere "description"
   * perché corrisponde esattamente
   * al ProductCategoryDto del backend.
   */
  description?: string;

  /**
   * Indica se la categoria
   * è utilizzabile nel gestionale.
   */
  active: boolean;
}