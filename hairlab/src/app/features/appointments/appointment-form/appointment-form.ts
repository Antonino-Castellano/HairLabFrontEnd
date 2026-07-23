import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  inject,
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
  AppointmentServiceRequest,
  AppointmentManagementRequest
} from '../../../models/appointment-management';

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
  AppointmentManagementService
} from '../../../service/appointment-management-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  EmployeeService
} from '../../../service/employee-service';

import {
  SalonProductService
} from '../../../service/salon-product-service';

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
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly managementService =
    inject(
      AppointmentManagementService
    );

  private readonly customerService =
    inject(CustomerService);

  private readonly employeeService =
    inject(EmployeeService);

  private readonly salonProductService =
    inject(SalonProductService);

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly salonProducts =
    signal<SalonProduct[]>([]);

  protected readonly items =
    signal<AppointmentDraftItem[]>([]);

  protected readonly customerId =
    signal<number | null>(null);

  protected readonly appointmentDate =
    signal(
      this.toDateInputValue(
        new Date()
      )
    );

  protected readonly appointmentTime =
    signal('09:00');

  protected readonly notes =
    signal('');

  protected readonly loading =
    signal(false);

  protected readonly saving =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly isEditMode =
    signal(false);

  protected readonly appointmentId =
    signal<number | null>(null);

  ngOnInit(): void {

    const idParam =
      this.route.snapshot
        .paramMap
        .get('id');

    if (
      idParam
    ) {

      const id =
        Number(idParam);

      if (
        Number.isNaN(id) ||
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

    this.loadLookups();
  }

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
          result.customers ?? []
        );

        this.employees.set(
          result.employees ?? []
        );

        this.salonProducts.set(
          result.products ?? []
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
            this.items().length ===
            0
          ) {

            this.addItem();
          }

          this.loading.set(
            false
          );
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

  protected onDateChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.appointmentDate.set(
      input.value
    );
  }

  protected onTimeChange(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.appointmentTime.set(
      input.value
    );
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

  protected addItem(): void {

    const firstProduct =
      this.salonProducts()[0];

    const firstEmployee =
      this.employees()[0];

    const item:
      AppointmentDraftItem = {

      salonProductId:
        firstProduct?.id ??
        null,

      employeeId:
        firstEmployee?.id ??
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
  }

  protected removeItem(
    index: number
  ): void {

    if (
      this.items().length <=
      1
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
  }

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
          Number(
            select.value
          )
      }
    );
  }

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

  protected save(): void {

    this.errorMessage.set(
      ''
    );

    const customerId =
      this.customerId();

    if (
      !customerId
    ) {

      this.errorMessage.set(
        'Seleziona un cliente.'
      );

      return;
    }

    if (
      !this.appointmentDate() ||
      !this.appointmentTime()
    ) {

      this.errorMessage.set(
        'Inserisci data e ora.'
      );

      return;
    }

    if (
      this.items().length ===
      0
    ) {

      this.errorMessage.set(
        'Inserisci almeno un servizio.'
      );

      return;
    }

    const invalidItem =
      this.items()
        .find(
          item =>
            !item.salonProductId ||
            !item.employeeId ||
            item.duration <=
              0 ||
            item.agreedPrice <
              0
        );

    if (
      invalidItem
    ) {

      this.errorMessage.set(
        'Controlla servizio, operatore, durata e prezzo di ogni riga.'
      );

      return;
    }

    const request:
      AppointmentManagementRequest = {

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
      value %
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
      error.status ===
      0
    ) {

      return (
        'Impossibile comunicare con il backend.'
      );
    }

    return fallback;
  }
}
