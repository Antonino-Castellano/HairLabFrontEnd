import {
  HttpClient
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  hairLabApi
} from '../core/config/api.config';

import {
  AppointmentAvailabilityRequest,
  EmployeeAvailability
} from '../models/appointment-availability';


/**
 * Service Angular dedicato alla verifica
 * preventiva della disponibilità
 * degli operatori.
 *
 * Questo Service permette al form appuntamento
 * di conoscere, prima del salvataggio,
 * quali dipendenti sono:
 *
 * - disponibili;
 * - occupati;
 * - coinvolti in un appuntamento sovrapposto.
 *
 * IMPORTANTE:
 *
 * questa verifica migliora la UX,
 * ma il backend continua comunque
 * a ricontrollare la disponibilità
 * durante il salvataggio.
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentAvailabilityService {

  /**
   * HttpClient iniettato tramite inject().
   */
  private readonly http =
    inject(HttpClient);

  /**
   * Endpoint base:
   *
   * /hairlab/api/appointment-availability
   */
  private readonly apiUrl =
    hairLabApi(
      'appointment-availability'
    );


  /**
   * Restituisce la disponibilità
   * di tutti gli operatori attivi
   * per lo slot richiesto.
   *
   * Esempio:
   *
   * startDateTime:
   * 2026-07-25T09:00:00
   *
   * duration:
   * 90
   *
   * significa:
   *
   * 09:00 -> 10:30
   */
  getEmployeeAvailability(
    request:
      AppointmentAvailabilityRequest
  ): Observable<EmployeeAvailability[]> {

    return this.http.post<
      EmployeeAvailability[]
    >(
      `${this.apiUrl}/employees`,
      request
    );
  }
}