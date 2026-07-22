import {
  AppointmentStatus
} from '../../models/enums/appointment-status';

/**
 * Etichette italiane
 * degli stati appuntamento.
 */
export const APPOINTMENT_STATUS_LABELS:
  Record<AppointmentStatus, string> = {

  [AppointmentStatus.BOOKED]:
    'Prenotato',

  [AppointmentStatus.CONFIRMED]:
    'Confermato',

  [AppointmentStatus.IN_PROGRESS]:
    'In corso',

  [AppointmentStatus.COMPLETED]:
    'Completato',

  [AppointmentStatus.CANCELLED]:
    'Cancellato',

  [AppointmentStatus.NO_SHOW]:
    'Non presentato'
};

/**
 * Stati modificabili manualmente
 * dal form appuntamento.
 *
 * COMPLETED e CANCELLED
 * hanno flussi dedicati.
 */
export const APPOINTMENT_EDITABLE_STATUSES:
  AppointmentStatus[] = [

  AppointmentStatus.BOOKED,

  AppointmentStatus.CONFIRMED,

  AppointmentStatus.IN_PROGRESS,

  AppointmentStatus.NO_SHOW
];
