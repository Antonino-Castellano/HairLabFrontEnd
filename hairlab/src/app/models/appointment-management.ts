import {
  Appointment
} from './appointment';

import {
  AppointmentItem
} from './appointment-item';

/**
 * Singolo servizio della request aggregata.
 */
export interface AppointmentServiceRequest {

  id?: number;

  salonProductId: number;

  employeeId: number;

  duration: number;

  agreedPrice: number;

  resultNotes?: string;
}

/**
 * Request per creare/modificare:
 *
 * Appointment
 * +
 * AppointmentItem[]
 *
 * Lo stato non è più presente.
 *
 * Viene gestito esclusivamente
 * dal workflow dedicato.
 */
export interface AppointmentManagementRequest {

  customerId: number;

  startDateTime: string;

  notes?: string;

  items: AppointmentServiceRequest[];
}

/**
 * Dettaglio aggregato.
 */
export interface AppointmentDetail {

  appointment: Appointment;

  items: AppointmentItem[];
}
