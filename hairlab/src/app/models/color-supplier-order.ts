import { InventoryUnit } from './enums/inventory-unit'; import { ProductType } from './enums/product-type';
export type ColorSupplierOrderStatus='DRAFT'|'ORDERED'|'PARTIALLY_RECEIVED'|'RECEIVED'|'CANCELLED';
export interface ColorSupplierOrderItem {id:number;hairDyeId:number;brand:string;lineName?:string|null;code:string;name:string;productType:ProductType;orderedQuantity:number;receivedQuantity:number;remainingQuantity:number;unit:InventoryUnit;}
export interface ColorSupplierOrder {id:number;orderNumber:string;supplierId:number;supplierName:string;status:ColorSupplierOrderStatus;orderedAt?:string|null;expectedDate?:string|null;receivedAt?:string|null;createdAt:string;updatedAt:string;createdBy?:string|null;notes?:string|null;items:ColorSupplierOrderItem[];}
export interface ColorSupplierOrderFromReorderRequest {selectedHairDyeIds?:number[];expectedDate?:string|null;notes?:string|null;}
export interface ColorSupplierOrderReceiveRequest {items:Array<{orderItemId:number;quantity:number}>;notes?:string|null;}
