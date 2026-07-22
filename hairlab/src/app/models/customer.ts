/**
 * Rappresenta un cliente del gestionale HairLab.
 *
 * Questo model corrisponde ai dati contenuti
 * nel CustomerDto del backend.
 */
export interface Customer {
  /**
   * Identificativo generato dal database.
   *
   * È opzionale perché durante la creazione
   * il cliente non possiede ancora un ID.
   */
  id?: number;

  /**
   * Dati anagrafici del cliente.
   */
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;

  /**
   * Data di nascita.
   *
   * Utilizziamo string perché LocalDate di Java
   * viene trasferito tramite JSON nel formato:
   *
   * YYYY-MM-DD
   */
  dob: string;

  /**
   * Indica se il cliente è attivo.
   */
  active: boolean;

  /**
   * Foto profilo del cliente.
   *
   * Contiene una stringa Base64 del tipo:
   *
   * data:image/jpeg;base64,/9j/4AAQ...
   *
   * Può essere null o undefined
   * quando il cliente non ha una foto.
   */
  profileImage?: string | null;

  /**
   * Date gestite automaticamente dal backend.
   */
  createdAt?: string;
  updatedAt?: string;

  /**
   * ID degli appuntamenti associati al cliente.
   */
  appointmentIds?: number[];
}