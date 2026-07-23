import {
  AppointmentStatus
} from './enums/appointment-status';

/**
 * Riga aggregata restituita
 * dall'endpoint Timeline.
 */
export interface AppointmentTimelineItem {

  appointmentItemId: number;

  appointmentId: number;

  customerId?: number;

  customerName: string;

  employeeId?: number;

  employeeName: string;

  salonProductId?: number;

  serviceName: string;

  scheduledTime: string;

  duration: number;

  status: AppointmentStatus;
}
