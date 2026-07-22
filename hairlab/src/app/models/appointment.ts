import { AppointmentStatus } from './enums/appointment-status';

export interface Appointment {

  id?: number;

  customerId: number;

  startDateTime: string;

  status: AppointmentStatus;

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
}