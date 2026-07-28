import { PaymentType } from "./enums/payment-type";


export interface Salon{
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  paymentType: PaymentType;
  subscriptionPlan: string;
  price: number;
}