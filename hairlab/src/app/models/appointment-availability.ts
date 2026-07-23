/**
 * Richiesta di verifica disponibilità.
 */
export interface AppointmentAvailabilityRequest {

  startDateTime: string;

  duration: number;

  /**
   * Usato in modifica per evitare
   * che l'appuntamento confligga con sé stesso.
   */
  excludeAppointmentId?: number;
}

/**
 * Disponibilità di un operatore
 * per lo slot richiesto.
 */
export interface EmployeeAvailability {

  employeeId: number;

  firstName: string;

  lastName: string;

  available: boolean;

  conflictingAppointmentId?: number;

  conflictStart?: string;

  conflictEnd?: string;

  message: string;
}
