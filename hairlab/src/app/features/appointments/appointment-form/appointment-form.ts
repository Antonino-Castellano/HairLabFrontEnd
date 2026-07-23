import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  EmployeeAvailability
} from '../../../models/appointment-availability';

import {
  AppointmentServiceRequest,
  AppointmentManagementRequest
} from '../../../models/appointment-management';


import {
  AppointmentSlotSuggestion
} from '../../../models/appointment-slot-search';

import {
  Customer
} from '../../../models/customer';

import {
  Employee
} from '../../../models/employee';

import {
  SalonProduct
} from '../../../models/salon-product';

import {
  AppointmentAvailabilityService
} from '../../../service/appointment-availability-service';

import {
  AppointmentManagementService
} from '../../../service/appointment-management-service';


import {
  AppointmentSlotSearchService
} from '../../../service/appointment-slot-search-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  EmployeeService
} from '../../../service/employee-service';

import {
  SalonProductService
} from '../../../service/salon-product-service';

/**
 * Singola riga del form.
 */
interface AppointmentDraftItem {

  salonProductId:
    number | null;

  employeeId:
    number | null;

  duration:
    number;

  agreedPrice:
    number;

  resultNotes:
    string;
}

/**
 * Disponibilità memorizzata per indice riga.
 */
type AvailabilityMap =
  Record<
    number,
    EmployeeAvailability[]
  >;

/**
 * Stato loading per indice riga.
 */
type AvailabilityLoadingMap =
  Record<
    number,
    boolean
  >;

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.css'
})
export class AppointmentFormComponent
  implements OnInit, OnDestroy {

  private readonly route =
    inject(
      ActivatedRoute
    );

  private readonly router =
    inject(
      Router
    );

  private readonly managementService =
    inject(
      AppointmentManagementService
    );

  private readonly availabilityService =
    inject(
      AppointmentAvailabilityService
    );

  private readonly slotSearchService =
    inject(
      AppointmentSlotSearchService
    );

  private readonly customerService =
    inject(
      CustomerService
    );

  private readonly employeeService =
    inject(
      EmployeeService
    );

  private readonly salonProductService =
    inject(
      SalonProductService
    );

  /**
   * Piccolo debounce per evitare
   * troppe chiamate mentre si modifica
   * rapidamente durata/data/orario.
   */
  private availabilityTimer:
    ReturnType<typeof setTimeout> |
    null =
      null;

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly salonProducts =
    signal<SalonProduct[]>([]);

  protected readonly items =
    signal<AppointmentDraftItem[]>([]);

  protected readonly customerId =
    signal<number | null>(
      null
    );

  protected readonly appointmentDate =
    signal(
      this.toDateInputValue(
        new Date()
      )
    );

  protected readonly appointmentTime =
    signal(
      '09:00'
    );

  protected readonly notes =
    signal('');

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly checkingAllAvailability =
    signal(false);

  /**
   * Finestra modificabile usata
   * dal motore di ricerca slot.
   *
   * 08:00 - 20:00 è solo un default UI:
   * l'utente può cambiarla liberamente.
   */
  protected readonly slotWindowStart =
    signal(
      '08:00'
    );

  protected readonly slotWindowEnd =
    signal(
      '20:00'
    );

  protected readonly slotSuggestions =
    signal<AppointmentSlotSuggestion[]>(
      []
    );

  protected readonly searchingSlots =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly availabilityByIndex =
    signal<AvailabilityMap>(
      {}
    );

  protected readonly availabilityLoadingByIndex =
    signal<AvailabilityLoadingMap>(
      {}
    );

  protected readonly isEditMode =
    signal(false);

  protected readonly appointmentId =
    signal<number | null>(
      null
    );

  ngOnInit(): void {

    const idParam =
      this.route.snapshot
        .paramMap
        .get('id');

    if (
      idParam
    ) {

      const id =
        Number(
          idParam
        );

      if (
        Number.isNaN(
          id
        ) ||
        id <= 0
      ) {

        this.errorMessage.set(
          'ID appuntamento non valido.'
        );

        return;
      }

      this.isEditMode.set(
        true
      );

      this.appointmentId.set(
        id
      );
    }

    /*
     * Arrivo dalla scheda cliente:
     *
     * /appointments/new?customerId=7
     */
    if (
      !this.isEditMode()
    ) {

      const customerIdParam =
        this.route.snapshot
          .queryParamMap
          .get(
            'customerId'
          );

      if (
        customerIdParam
      ) {

        const preselectedCustomerId =
          Number(
            customerIdParam
          );

        if (
          !Number.isNaN(
            preselectedCustomerId
          ) &&
          preselectedCustomerId > 0
        ) {

          this.customerId.set(
            preselectedCustomerId
          );
        }
      }
    }

    this.loadLookups();
  }

  ngOnDestroy(): void {

    if (
      this.availabilityTimer
    ) {

      clearTimeout(
        this.availabilityTimer
      );
    }
  }

  /**
   * Lookup necessari al form.
   */
  private loadLookups(): void {

    this.loading.set(
      true
    );

    forkJoin({

      customers:
        this.customerService
          .getActive(),

      employees:
        this.employeeService
          .getActive(),

      products:
        this.salonProductService
          .getActive()

    }).subscribe({

      next: result => {

        this.customers.set(
          result.customers ??
          []
        );

        if (
          !this.isEditMode() &&
          this.customerId() &&
          !this.customers()
            .some(
              customer =>
                customer.id ===
                this.customerId()
            )
        ) {

          this.customerId.set(
            null
          );
        }

        this.employees.set(
          result.employees ??
          []
        );

        this.salonProducts.set(
          result.products ??
          []
        );

        if (
          this.isEditMode() &&
          this.appointmentId()
        ) {

          this.loadAppointment(
            this.appointmentId()!
          );

        } else {

          this.addItem();

          this.loading.set(
            false
          );

          this.scheduleAvailabilityRefresh();
        }
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.loading.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile caricare i dati necessari al form.'
          )
        );
      }
    });
  }

  /**
   * Carica appuntamento in modifica.
   */
  private loadAppointment(
    id: number
  ): void {

    this.managementService
      .getById(
        id
      )
      .subscribe({

        next: detail => {

          const appointment =
            detail.appointment;

          this.customerId.set(
            appointment.customerId
          );

          this.appointmentDate.set(
            appointment.startDateTime
              .substring(
                0,
                10
              )
          );

          this.appointmentTime.set(
            appointment.startDateTime
              .substring(
                11,
                16
              )
          );

          this.notes.set(
            appointment.notes ??
            ''
          );

          this.items.set(
            detail.items.map(
              item => ({

                salonProductId:
                  item.salonProductId,

                employeeId:
                  item.employeeId,

                duration:
                  item.duration,

                agreedPrice:
                  item.agreedPrice,

                resultNotes:
                  item.resultNotes ??
                  ''
              })
            )
          );

          if (
            this.items().length === 0
          ) {

            this.addItem();
          }

          this.loading.set(
            false
          );

          this.scheduleAvailabilityRefresh();
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loading.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile caricare l’appuntamento.'
            )
          );
        }
      });
  }

  protected onCustomerChange(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;

    this.customerId.set(
      select.value
        ? Number(
            select.value
          )
        : null
    );
  }

  /**
   * Data modificata:
   * tutte le disponibilità cambiano.
   */
  protected onDateChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.appointmentDate.set(
      input.value
    );

    this.scheduleAvailabilityRefresh();
  }

  /**
   * Ora iniziale modificata:
   * cambiano gli slot di tutte le righe.
   */
  protected onTimeChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.appointmentTime.set(
      input.value
    );

    this.scheduleAvailabilityRefresh();
  }

  protected onNotesInput(
    event: Event
  ): void {

    const textarea =
      event.target as
        HTMLTextAreaElement;

    this.notes.set(
      textarea.value
    );
  }

  /**
   * Aggiunge una riga.
   *
   * Non assegniamo automaticamente
   * il primo operatore:
   *
   * prima mostriamo chi è libero.
   */
  protected addItem(): void {

    const firstProduct =
      this.salonProducts()[0];

    const item:
      AppointmentDraftItem = {

      salonProductId:
        firstProduct?.id ??
        null,

      employeeId:
        null,

      duration:
        firstProduct?.duration ??
        30,

      agreedPrice:
        firstProduct?.basePrice ??
        0,

      resultNotes:
        ''
    };

    this.items.update(
      current => [
        ...current,
        item
      ]
    );

    this.scheduleAvailabilityRefresh();
  }

  protected removeItem(
    index: number
  ): void {

    if (
      this.items().length <= 1
    ) {

      this.errorMessage.set(
        'Un appuntamento deve contenere almeno un servizio.'
      );

      return;
    }

    this.items.update(
      current =>
        current.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        )
    );

    /*
     * Gli indici delle righe cambiano:
     * ricostruiamo da zero le mappe.
     */
    this.availabilityByIndex.set(
      {}
    );

    this.availabilityLoadingByIndex.set(
      {}
    );

    this.scheduleAvailabilityRefresh();
  }

  /**
   * Cambio servizio:
   *
   * - durata proposta;
   * - prezzo base;
   * - nuova verifica disponibilità.
   */
  protected onProductChange(
    index: number,
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;

    const productId =
      Number(
        select.value
      );

    const product =
      this.salonProducts()
        .find(
          item =>
            item.id ===
            productId
        );

    this.updateItem(
      index,
      {

        salonProductId:
          productId,

        duration:
          product?.duration ??
          30,

        agreedPrice:
          product?.basePrice ??
          0
      }
    );

    this.scheduleAvailabilityRefresh();
  }

  protected onEmployeeChange(
    index: number,
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;

    this.updateItem(
      index,
      {

        employeeId:
          select.value
            ? Number(
                select.value
              )
            : null
      }
    );

    this.invalidateSlotSuggestions();
  }

  /**
   * Una durata diversa modifica:
   *
   * - fine dello slot corrente;
   * - orario dei servizi successivi.
   */
  protected onDurationInput(
    index: number,
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.updateItem(
      index,
      {

        duration:
          Number(
            input.value
          )
      }
    );

    this.scheduleAvailabilityRefresh();
  }

  protected onPriceInput(
    index: number,
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.updateItem(
      index,
      {

        agreedPrice:
          Number(
            input.value
          )
      }
    );
  }

  protected onResultNotesInput(
    index: number,
    event: Event
  ): void {

    const textarea =
      event.target as
        HTMLTextAreaElement;

    this.updateItem(
      index,
      {

        resultNotes:
          textarea.value
      }
    );
  }

  /**
   * Verifica manualmente una singola riga.
   */
  protected refreshAvailability(
    index: number
  ): void {

    const item =
      this.items()[index];

    if (
      !item ||
      !this.appointmentDate() ||
      !this.appointmentTime() ||
      item.duration <= 0
    ) {

      return;
    }

    this.setAvailabilityLoading(
      index,
      true
    );

    this.availabilityService
      .getEmployeeAvailability({

        startDateTime:
          this.getItemStartDateTime(
            index
          ),

        duration:
          item.duration,

        excludeAppointmentId:
          this.appointmentId() ??
          undefined

      })
      .subscribe({

        next: availability => {

          this.availabilityByIndex.update(
            current => ({
              ...current,
              [index]:
                availability ?? []
            })
          );

          this.setAvailabilityLoading(
            index,
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.setAvailabilityLoading(
            index,
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile verificare la disponibilità operatori.'
            )
          );
        }
      });
  }

  /**
   * Seleziona automaticamente
   * il primo operatore libero.
   */
  protected chooseFirstAvailableEmployee(
    index: number
  ): void {

    const firstAvailable =
      this.getAvailability(
        index
      )
        .find(
          result =>
            result.available
        );

    if (
      !firstAvailable
    ) {

      this.errorMessage.set(
        'Nessun operatore disponibile per questo servizio nello slot richiesto.'
      );

      return;
    }

    this.updateItem(
      index,
      {

        employeeId:
          firstAvailable.employeeId
      }
    );

    this.errorMessage.set(
      ''
    );
  }

  /**
   * Disponibilità completa della riga.
   */
  protected getAvailability(
    index: number
  ): EmployeeAvailability[] {

    return (
      this.availabilityByIndex()[
        index
      ] ??
      []
    );
  }

  /**
   * Numero operatori liberi.
   */
  protected getAvailableEmployeeCount(
    index: number
  ): number {

    return this.getAvailability(
      index
    )
      .filter(
        result =>
          result.available
      )
      .length;
  }

  protected isAvailabilityLoading(
    index: number
  ): boolean {

    return (
      this.availabilityLoadingByIndex()[
        index
      ] ??
      false
    );
  }

  /**
   * Risultato del dipendente selezionato.
   */
  protected getSelectedEmployeeAvailability(
    index: number
  ):
    EmployeeAvailability |
    undefined {

    const employeeId =
      this.items()[
        index
      ]?.employeeId;

    if (
      !employeeId
    ) {

      return undefined;
    }

    return this.getAvailability(
      index
    )
      .find(
        result =>
          result.employeeId ===
          employeeId
      );
  }

  /**
   * Un option viene disabilitato
   * solo dopo una verifica conclusa
   * che lo dichiara occupato.
   */
  protected isEmployeeUnavailable(
    index: number,
    employeeId:
      number | undefined
  ): boolean {

    if (
      !employeeId
    ) {

      return false;
    }

    const availability =
      this.getAvailability(
        index
      )
        .find(
          result =>
            result.employeeId ===
            employeeId
        );

    return (
      availability != null &&
      !availability.available
    );
  }

  /**
   * Etichetta del select.
   */
  protected getEmployeeOptionLabel(
    index: number,
    employee: Employee
  ): string {

    const name =
      `${employee.firstName} ${employee.lastName}`;

    if (
      !employee.id
    ) {

      return name;
    }

    const availability =
      this.getAvailability(
        index
      )
        .find(
          result =>
            result.employeeId ===
            employee.id
        );

    if (
      !availability
    ) {

      return name;
    }

    return availability.available
      ? `${name} · libero`
      : `${name} · occupato`;
  }

  protected getItemStartTime(
    index: number
  ): string {

    let minutes =
      this.timeToMinutes(
        this.appointmentTime()
      );

    for (
      let currentIndex = 0;
      currentIndex < index;
      currentIndex++
    ) {

      minutes +=
        this.items()[
          currentIndex
        ].duration ||
        0;
    }

    return this.minutesToTime(
      minutes
    );
  }

  protected getItemEndTime(
    index: number
  ): string {

    const item =
      this.items()[
        index
      ];

    const startMinutes =
      this.timeToMinutes(
        this.getItemStartTime(
          index
        )
      );

    return this.minutesToTime(
      startMinutes +
      (
        item?.duration ??
        0
      )
    );
  }


  /**
   * Modifica inizio finestra ricerca.
   */
  protected onSlotWindowStartChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.slotWindowStart.set(
      input.value
    );

    this.invalidateSlotSuggestions();
  }

  /**
   * Modifica fine finestra ricerca.
   */
  protected onSlotWindowEndChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.slotWindowEnd.set(
      input.value
    );

    this.invalidateSlotSuggestions();
  }

  /**
   * TRUE quando ogni servizio
   * ha già un operatore assegnato.
   */
  protected canSearchSlots():
    boolean {

    return (
      this.items().length > 0
      &&
      this.items()
        .every(
          item =>
            item.employeeId != null
            &&
            item.duration > 0
        )
      &&
      !!this.appointmentDate()
      &&
      !!this.slotWindowStart()
      &&
      !!this.slotWindowEnd()
    );
  }

  /**
   * Cerca i primi orari in cui
   * l'intera sequenza dei servizi
   * può essere eseguita.
   */
  protected searchAvailableSlots():
    void {

    this.errorMessage.set(
      ''
    );

    this.slotSuggestions.set(
      []
    );

    if (
      !this.canSearchSlots()
    ) {

      this.errorMessage.set(
        'Per cercare gli orari liberi assegna prima un operatore a ogni servizio.'
      );

      return;
    }

    if (
      this.slotWindowStart() >=
      this.slotWindowEnd()
    ) {

      this.errorMessage.set(
        'La fine della finestra di ricerca deve essere successiva all’inizio.'
      );

      return;
    }

    this.searchingSlots.set(
      true
    );

    this.slotSearchService
      .search({

        date:
          this.appointmentDate(),

        windowStart:
          this.slotWindowStart(),

        windowEnd:
          this.slotWindowEnd(),

        stepMinutes:
          15,

        maxResults:
          8,

        excludeAppointmentId:
          this.appointmentId() ??
          undefined,

        items:
          this.items().map(
            item => ({
              employeeId:
                item.employeeId!,
              duration:
                item.duration
            })
          )

      })
      .subscribe({

        next: suggestions => {

          this.slotSuggestions.set(
            suggestions ??
            []
          );

          this.searchingSlots.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.searchingSlots.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile cercare gli orari disponibili.'
            )
          );
        }
      });
  }

  /**
   * Applica una proposta:
   *
   * cambia l'ora iniziale dell'appuntamento
   * e ricalcola la disponibilità di ogni servizio.
   */
  protected applySlotSuggestion(
    suggestion:
      AppointmentSlotSuggestion
  ): void {

    this.appointmentTime.set(
      suggestion.startDateTime
        .substring(
          11,
          16
        )
    );

    this.invalidateSlotSuggestions();

    this.scheduleAvailabilityRefresh();
  }

  /**
   * Ora leggibile HH:mm.
   */
  protected getSuggestionStart(
    suggestion:
      AppointmentSlotSuggestion
  ): string {

    return suggestion.startDateTime
      .substring(
        11,
        16
      );
  }

  /**
   * Ora leggibile HH:mm.
   */
  protected getSuggestionEnd(
    suggestion:
      AppointmentSlotSuggestion
  ): string {

    return suggestion.endDateTime
      .substring(
        11,
        16
      );
  }

  protected getTotalDuration():
    number {

    return this.items()
      .reduce(
        (
          total,
          item
        ) =>
          total +
          (
            item.duration ||
            0
          ),
        0
      );
  }

  protected getTotalPrice():
    number {

    return this.items()
      .reduce(
        (
          total,
          item
        ) =>
          total +
          (
            item.agreedPrice ||
            0
          ),
        0
      );
  }

  /**
   * Salvataggio:
   *
   * 1. validazione form;
   * 2. nuova verifica FRESCA di tutti gli slot;
   * 3. blocco se almeno un operatore è occupato;
   * 4. solo dopo inviamo AppointmentManagementRequest.
   *
   * Il backend ricontrollerà comunque.
   */
  protected save(): void {

    this.errorMessage.set(
      ''
    );

    const request =
      this.buildManagementRequest();

    if (
      !request
    ) {

      return;
    }

    this.verifyAvailabilityBeforeSave(
      request
    );
  }

  /**
   * Verifica preventiva finale.
   */
  private verifyAvailabilityBeforeSave(
    request:
      AppointmentManagementRequest
  ): void {

    this.checkingAllAvailability.set(
      true
    );

    const checks =
      request.items.map(
        (
          item,
          index
        ) =>
          this.availabilityService
            .getEmployeeAvailability({

              startDateTime:
                this.getItemStartDateTime(
                  index
                ),

              duration:
                item.duration,

              excludeAppointmentId:
                this.appointmentId() ??
                undefined
            })
      );

    forkJoin(
      checks
    ).subscribe({

      next: results => {

        this.checkingAllAvailability.set(
          false
        );

        /*
         * Aggiorniamo anche ciò che vede l'utente.
         */
        const newMap:
          AvailabilityMap =
            {};

        results.forEach(
          (
            result,
            index
          ) => {

            newMap[index] =
              result;
          }
        );

        this.availabilityByIndex.set(
          newMap
        );

        for (
          let index = 0;
          index < request.items.length;
          index++
        ) {

          const selectedEmployeeId =
            request.items[
              index
            ].employeeId;

          const employeeResult =
            results[
              index
            ].find(
              result =>
                result.employeeId ===
                selectedEmployeeId
            );

          if (
            !employeeResult
          ) {

            this.errorMessage.set(
              `L'operatore del servizio ${index + 1} non è più disponibile o non è attivo.`
            );

            return;
          }

          if (
            !employeeResult.available
          ) {

            this.errorMessage.set(
              `Servizio ${index + 1}: ${employeeResult.message}`
            );

            return;
          }
        }

        this.submitAppointment(
          request
        );
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.checkingAllAvailability.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile verificare la disponibilità prima del salvataggio.'
          )
        );
      }
    });
  }

  /**
   * Invio reale dopo i controlli.
   */
  private submitAppointment(
    request:
      AppointmentManagementRequest
  ): void {

    this.saving.set(
      true
    );

    const request$ =
      this.isEditMode() &&
      this.appointmentId()

        ? this.managementService
            .update(
              this.appointmentId()!,
              request
            )

        : this.managementService
            .insert(
              request
            );

    request$.subscribe({

      next: detail => {

        this.saving.set(
          false
        );

        this.router.navigate(
          [
            '/appointments',
            detail.appointment.id
          ]
        );
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.saving.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile salvare l’appuntamento.'
          )
        );
      }
    });
  }

  /**
   * Costruisce la request oppure
   * restituisce null se il form non è valido.
   */
  private buildManagementRequest():
    AppointmentManagementRequest |
    null {

    const customerId =
      this.customerId();

    if (
      !customerId
    ) {

      this.errorMessage.set(
        'Seleziona un cliente.'
      );

      return null;
    }

    if (
      !this.appointmentDate() ||
      !this.appointmentTime()
    ) {

      this.errorMessage.set(
        'Inserisci data e ora.'
      );

      return null;
    }

    if (
      this.items().length === 0
    ) {

      this.errorMessage.set(
        'Inserisci almeno un servizio.'
      );

      return null;
    }

    const invalidItem =
      this.items()
        .find(
          item =>
            !item.salonProductId ||
            !item.employeeId ||
            item.duration <= 0 ||
            item.agreedPrice < 0
        );

    if (
      invalidItem
    ) {

      this.errorMessage.set(
        'Controlla servizio, operatore, durata e prezzo di ogni riga.'
      );

      return null;
    }

    return {

      customerId,

      startDateTime:
        `${this.appointmentDate()}T` +
        `${this.appointmentTime()}:00`,

      notes:
        this.notes().trim() ||
        undefined,

      items:
        this.items().map(
          item => {

            const result:
              AppointmentServiceRequest = {

              salonProductId:
                item.salonProductId!,

              employeeId:
                item.employeeId!,

              duration:
                item.duration,

              agreedPrice:
                item.agreedPrice,

              resultNotes:
                item.resultNotes
                  .trim() ||
                undefined
            };

            return result;
          }
        )
    };
  }

  /**
   * Refresh automatico con debounce.
   */
  private scheduleAvailabilityRefresh():
    void {

    this.invalidateSlotSuggestions();

    if (
      this.availabilityTimer
    ) {

      clearTimeout(
        this.availabilityTimer
      );
    }

    this.availabilityTimer =
      setTimeout(
        () => {

          this.refreshAllAvailability();
        },
        300
      );
  }

  /**
   * Verifica tutte le righe.
   */
  private refreshAllAvailability():
    void {

    this.items()
      .forEach(
        (
          _,
          index
        ) => {

          this.refreshAvailability(
            index
          );
        }
      );
  }


  /**
   * Ogni variazione di:
   *
   * - data;
   * - ora;
   * - durata;
   * - operatore;
   * - sequenza servizi;
   *
   * rende obsolete le proposte precedenti.
   */
  private invalidateSlotSuggestions():
    void {

    this.slotSuggestions.set(
      []
    );
  }

  private setAvailabilityLoading(
    index: number,
    value: boolean
  ): void {

    this.availabilityLoadingByIndex
      .update(
        current => ({
          ...current,
          [index]:
            value
        })
      );
  }

  private getItemStartDateTime(
    index: number
  ): string {

    return (
      `${this.appointmentDate()}T` +
      `${this.getItemStartTime(index)}:00`
    );
  }

  private updateItem(
    index: number,
    patch:
      Partial<AppointmentDraftItem>
  ): void {

    this.items.update(
      current =>
        current.map(
          (
            item,
            currentIndex
          ) =>
            currentIndex ===
            index
              ? {
                  ...item,
                  ...patch
                }
              : item
        )
    );
  }

  private timeToMinutes(
    time: string
  ): number {

    const [
      hours,
      minutes
    ] =
      time
        .split(':')
        .map(
          Number
        );

    return (
      hours * 60 +
      minutes
    );
  }

  private minutesToTime(
    value: number
  ): string {

    const normalized =
      (
        value %
        (
          24 * 60
        ) +
        (
          24 * 60
        )
      ) %
      (
        24 * 60
      );

    const hours =
      Math.floor(
        normalized /
        60
      );

    const minutes =
      normalized %
      60;

    return (
      String(
        hours
      ).padStart(
        2,
        '0'
      ) +
      ':' +
      String(
        minutes
      ).padStart(
        2,
        '0'
      )
    );
  }

  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() +
        1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return (
      `${year}-${month}-${day}`
    );
  }

  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const backendMessage =
      error.error?.message;

    if (
      typeof backendMessage ===
        'string' &&
      backendMessage.trim()
    ) {

      return backendMessage;
    }

    if (
      error.status === 0
    ) {

      return (
        'Impossibile comunicare con il backend.'
      );
    }

    return fallback;
  }
}
