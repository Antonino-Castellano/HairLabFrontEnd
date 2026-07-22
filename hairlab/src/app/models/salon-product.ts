export interface SalonProduct {

  id?: number;

  productCategoryId: number;

  name: string;

  desc?: string;

  duration: number;

  basePrice: number;

  active: boolean;
}