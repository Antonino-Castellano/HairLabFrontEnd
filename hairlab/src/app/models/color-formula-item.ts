import {
  InventoryUnit
} from './enums/inventory-unit';

/**
 * Singolo ingrediente di una formula.
 *
 * Un item = un solo prodotto tecnico
 * + quantità precisa.
 */
export interface ColorFormulaItem {

  id?: number;

  colorFormulaId: number;

  hairDyeId: number;

  quantity: number;

  unit: InventoryUnit;

  notes?: string;
}
