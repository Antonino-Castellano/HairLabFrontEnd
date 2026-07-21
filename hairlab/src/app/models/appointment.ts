import { AppointmentStatus } from './enums/appointmentStatus';

export interface Appointment {

  id?: number;

  customerId: number;

  startDateTime: string;

  status: AppointmentStatus;

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
}