export interface AppointmentItem {

  id?: number;

  appointmentId: number;

  salonProductId: number;

  employeeId: number;

  scheduledTime: string;

  duration: number;

  agreedPrice: number;

  resultNotes?: string;

  completedAt?: string | null;
}