import { Role } from './enums/role';
import { PaymentType } from './enums/payment-type';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  email: string;
  password?: string;
  dob?: Date;
  role?: Role;
  
  // Campi di abbonamento e pagamento
  paymentType?: PaymentType;
  subscriptionPlan?: string;
  price?: number;

  customerId?: number | null;
  profileImage?: string | null;

  cardNumber?: string;
  cardHolder?: string;
  cardExpDate?: string;
  cardCvv?: string;
  paypalEmail?: string;
}