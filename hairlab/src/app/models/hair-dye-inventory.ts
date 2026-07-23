import {
  InventoryUnit
} from './enums/inventory-unit';

/**
 * Giacenza corrente di un prodotto tecnico.
 */
export interface HairDyeInventory {

  id?: number;

  hairDyeId: number;

  quantityAvailable: number;

  unit: InventoryUnit;

  lowStockThreshold: number;

  updatedAt?: string;
}
