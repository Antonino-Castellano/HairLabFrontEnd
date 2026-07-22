import {
  Appointment
} from './appointment';

import {
  AppointmentItem
} from './appointment-item';

import {
  AppointmentStatus
} from './enums/appointment-status';

/**
 * Singolo servizio inviato
 * nella request aggregata.
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
 * Request per creare/modificare
 * appuntamento + servizi.
 */
export interface AppointmentManagementRequest {

  customerId: number;

  startDateTime: string;

  status?: AppointmentStatus;

  notes?: string;

  items: AppointmentServiceRequest[];
}

/**
 * Dettaglio aggregato restituito dal backend.
 */
export interface AppointmentDetail {

  appointment: Appointment;

  items: AppointmentItem[];
}
