export interface Customer {
  id?: number;

  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;

  dob: string;

  active: boolean;

  createdAt?: string;
  updatedAt?: string;

  appointmentIds?: number[];
}