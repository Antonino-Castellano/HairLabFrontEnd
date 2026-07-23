import {
  DatePipe
} from '@angular/common';

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
  AppointmentDetail
} from '../../../models/appointment-management';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

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
  AppointmentService
} from '../../../service/appointment-service';

import {
  AppointmentWorkflowService
} from '../../../service/appointment-workflow-service';

import {
  CustomerService
} from '../../../service/customer-service';

import {
  EmployeeService
} from '../../../service/employee-service';

import {
  SalonProductService
} from '../../../service/salon-product-service';

import {
  APPOINTMENT_STATUS_LABELS
} from '../appointment-display';

type WorkflowAction =
  | 'confirm'
  | 'start'
  | 'complete'
  | 'no-show';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.css'
})
export class AppointmentDetailComponent
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly managementService =
    inject(
      AppointmentManagementService
    );

  private readonly appointmentService =
    inject(
      AppointmentService
    );

  private readonly workflowService =
    inject(
      AppointmentWorkflowService
    );

  private readonly customerService =
    inject(CustomerService);

  private readonly employeeService =
    inject(EmployeeService);

  private readonly salonProductService =
    inject(
      SalonProductService
    );

  protected readonly detail =
    signal<
      AppointmentDetail |
      null
    >(
      null
    );

  protected readonly customers =
    signal<Customer[]>([]);

  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly products =
    signal<SalonProduct[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly workflowLoading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly successMessage =
    signal('');

  protected readonly statusLabels =
    APPOINTMENT_STATUS_LABELS;

  protected readonly AppointmentStatus =
    AppointmentStatus;

  private appointmentId:
    number | null =
      null;

  ngOnInit(): void {

    const idParam =
      this.route.snapshot
        .paramMap
        .get('id');

    if (
      !idParam
    ) {

      this.errorMessage.set(
        'ID appuntamento non presente.'
      );

      return;
    }

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

    this.appointmentId =
      id;

    this.loadDetail(
      id
    );
  }

  private loadDetail(
    id: number
  ): void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    forkJoin({

      detail:
        this.managementService
          .getById(
            id
          ),

      customers:
        this.customerService
          .getAll(),

      employees:
        this.employeeService
          .getAll(),

      products:
        this.salonProductService
          .getAll()

    }).subscribe({

      next: result => {

        this.detail.set(
          result.detail
        );

        this.customers.set(
          result.customers ??
          []
        );

        this.employees.set(
          result.employees ??
          []
        );

        this.products.set(
          result.products ??
          []
        );

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
            'Impossibile caricare il dettaglio appuntamento.'
          )
        );
      }
    });
  }

  protected getCustomerName(
    customerId: number
  ): string {

    const customer =
      this.customers()
        .find(
          item =>
            item.id ===
            customerId
        );

    return customer
      ? `${customer.firstName} ${customer.lastName}`
      : `Cliente #${customerId}`;
  }

  protected getEmployeeName(
    employeeId: number
  ): string {

    const employee =
      this.employees()
        .find(
          item =>
            item.id ===
            employeeId
        );

    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : `Dipendente #${employeeId}`;
  }

  protected getProductName(
    productId: number
  ): string {

    const product =
      this.products()
        .find(
          item =>
            item.id ===
            productId
        );

    return product
      ? product.name
      : `Servizio #${productId}`;
  }

  protected getTotalDuration():
    number {

    return (
      this.detail()
        ?.items
        .reduce(
          (
            total,
            item
          ) =>
            total +
            item.duration,
          0
        ) ??
      0
    );
  }

  protected getTotalPrice():
    number {

    return (
      this.detail()
        ?.items
        .reduce(
          (
            total,
            item
          ) =>
            total +
            item.agreedPrice,
          0
        ) ??
      0
    );
  }

  /**
   * Modifica strutturale consentita
   * solamente prima dell'avvio.
   */
  protected canEdit():
    boolean {

    const status =
      this.detail()
        ?.appointment
        .status;

    return (
      status ===
        AppointmentStatus.BOOKED ||
      status ===
        AppointmentStatus.CONFIRMED
    );
  }

  protected canCancel():
    boolean {

    return this.canEdit();
  }

  protected canConfirm():
    boolean {

    return (
      this.detail()
        ?.appointment
        .status ===
      AppointmentStatus.BOOKED
    );
  }

  protected canStart():
    boolean {

    const status =
      this.detail()
        ?.appointment
        .status;

    return (
      status ===
        AppointmentStatus.BOOKED ||
      status ===
        AppointmentStatus.CONFIRMED
    );
  }

  protected canComplete():
    boolean {

    return (
      this.detail()
        ?.appointment
        .status ===
      AppointmentStatus.IN_PROGRESS
    );
  }

  protected canMarkNoShow():
    boolean {

    const status =
      this.detail()
        ?.appointment
        .status;

    return (
      status ===
        AppointmentStatus.BOOKED ||
      status ===
        AppointmentStatus.CONFIRMED
    );
  }

  protected confirmAppointment():
    void {

    this.executeWorkflow(
      'confirm',
      'Appuntamento confermato.'
    );
  }

  protected startAppointment():
    void {

    const confirmed =
      confirm(
        'Vuoi avviare questo appuntamento?'
      );

    if (
      !confirmed
    ) {

      return;
    }

    this.executeWorkflow(
      'start',
      'Appuntamento avviato.'
    );
  }

  protected completeAppointment():
    void {

    const confirmed =
      confirm(
        'Confermi che l’appuntamento è stato completato?\n\n' +
        'I servizi ancora aperti verranno marcati come completati.'
      );

    if (
      !confirmed
    ) {

      return;
    }

    this.executeWorkflow(
      'complete',
      'Appuntamento completato.'
    );
  }

  protected markNoShow():
    void {

    const confirmed =
      confirm(
        'Segnare il cliente come non presentato?'
      );

    if (
      !confirmed
    ) {

      return;
    }

    this.executeWorkflow(
      'no-show',
      'Appuntamento segnato come non presentato.'
    );
  }

  protected cancelAppointment():
    void {

    const appointment =
      this.detail()
        ?.appointment;

    if (
      !appointment?.id
    ) {

      return;
    }

    const confirmed =
      confirm(
        'Vuoi cancellare questo appuntamento?\n\n' +
        'Lo storico rimarrà disponibile.'
      );

    if (
      !confirmed
    ) {

      return;
    }

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );

    this.workflowLoading.set(
      true
    );

    this.appointmentService
      .delete(
        appointment.id
      )
      .subscribe({

        next: () => {

          this.workflowLoading.set(
            false
          );

          this.successMessage.set(
            'Appuntamento cancellato.'
          );

          this.loadDetail(
            appointment.id!
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.workflowLoading.set(
            false
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Impossibile cancellare l’appuntamento.'
            )
          );
        }
      });
  }

  private executeWorkflow(
    action: WorkflowAction,
    successMessage: string
  ): void {

    const id =
      this.appointmentId;

    if (
      !id
    ) {

      return;
    }

    this.workflowLoading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.successMessage.set(
      ''
    );

    let request$;

    switch (
      action
    ) {

      case 'confirm':

        request$ =
          this.workflowService
            .confirm(
              id
            );

        break;

      case 'start':

        request$ =
          this.workflowService
            .start(
              id
            );

        break;

      case 'complete':

        request$ =
          this.workflowService
            .complete(
              id
            );

        break;

      case 'no-show':

        request$ =
          this.workflowService
            .markNoShow(
              id
            );

        break;
    }

    request$.subscribe({

      next: () => {

        this.workflowLoading.set(
          false
        );

        this.successMessage.set(
          successMessage
        );

        this.loadDetail(
          id
        );
      },

      error: (
        error:
          HttpErrorResponse
      ) => {

        this.workflowLoading.set(
          false
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Impossibile modificare lo stato dell’appuntamento.'
          )
        );
      }
    });
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

    return fallback;
  }
}
