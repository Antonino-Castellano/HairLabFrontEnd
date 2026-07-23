/**
 * Servizio utilizzato durante
 * la ricerca di uno slot completo.
 */
export interface AppointmentSlotSearchItem {

  employeeId: number;

  duration: number;
}

/**
 * Richiesta di ricerca slot.
 */
export interface AppointmentSlotSearchRequest {

  date: string;

  windowStart: string;

  windowEnd: string;

  stepMinutes: number;

  maxResults: number;

  excludeAppointmentId?: number;

  items: AppointmentSlotSearchItem[];
}

/**
 * Orario disponibile suggerito dal backend.
 */
export interface AppointmentSlotSuggestion {

  startDateTime: string;

  endDateTime: string;

  totalDuration: number;
}
