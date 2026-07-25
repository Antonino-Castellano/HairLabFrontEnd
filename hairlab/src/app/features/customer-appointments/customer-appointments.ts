import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  CustomerArea,
  CustomerBookingSlot,
  CustomerPortalAppointment,
} from '../../models/customer-area';
import { AppointmentStatus } from '../../models/enums/appointment-status';
import { CustomerAreaService } from '../../service/customer-area-service';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog.service';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-customer-appointments',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './customer-appointments.html',
  styleUrl: './customer-appointments.css',
})
export class CustomerAppointmentsComponent implements OnInit {
  private readonly customerAreaService = inject(CustomerAreaService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  protected readonly area = signal<CustomerArea | null>(null);
  protected readonly loading = signal(true);
  protected readonly searchingSlots = signal(false);
  protected readonly booking = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly slots = signal<CustomerBookingSlot[]>([]);

  protected selectedServiceId: number | null = null;
  protected selectedEmployeeId: number | null = null;
  protected selectedDate = this.toDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000));
  protected selectedSlot = '';
  protected notes = '';

  protected readonly minDate = this.toDateInput(new Date());
  protected readonly maxDate = this.toDateInput(new Date(Date.now() + 120 * 24 * 60 * 60 * 1000));

  protected readonly appointmentStatusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.BOOKED]: 'Prenotato',
    [AppointmentStatus.CONFIRMED]: 'Confermato',
    [AppointmentStatus.IN_PROGRESS]: 'In corso',
    [AppointmentStatus.COMPLETED]: 'Completato',
    [AppointmentStatus.CANCELLED]: 'Annullato',
    [AppointmentStatus.NO_SHOW]: 'Non presentato',
  };

  protected readonly upcomingAppointments = computed(() =>
    (this.area()?.appointmentDetails ?? [])
      .filter(
        (appointment) =>
          new Date(appointment.startDateTime).getTime() >= Date.now() &&
          appointment.status !== AppointmentStatus.CANCELLED &&
          appointment.status !== AppointmentStatus.NO_SHOW,
      )
      .sort(
        (first, second) =>
          new Date(first.startDateTime).getTime() - new Date(second.startDateTime).getTime(),
      ),
  );

  protected readonly appointmentHistory = computed(() =>
    (this.area()?.appointmentDetails ?? [])
      .filter(
        (appointment) =>
          new Date(appointment.startDateTime).getTime() < Date.now() ||
          appointment.status === AppointmentStatus.COMPLETED ||
          appointment.status === AppointmentStatus.CANCELLED ||
          appointment.status === AppointmentStatus.NO_SHOW,
      )
      .sort(
        (first, second) =>
          new Date(second.startDateTime).getTime() - new Date(first.startDateTime).getTime(),
      ),
  );

  ngOnInit(): void {
    const serviceId = Number(this.activatedRoute.snapshot.queryParamMap.get('serviceId'));
    const employeeId = Number(this.activatedRoute.snapshot.queryParamMap.get('employeeId'));

    this.selectedServiceId = Number.isFinite(serviceId) && serviceId > 0 ? serviceId : null;
    this.selectedEmployeeId = Number.isFinite(employeeId) && employeeId > 0 ? employeeId : null;

    this.loadArea();
  }

  protected loadArea(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.customerAreaService.getMyArea().subscribe({
      next: (area) => {
        this.area.set(area);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.errorText(error, 'Impossibile caricare gli appuntamenti.'));
      },
    });
  }

  protected resetAvailability(): void {
    this.slots.set([]);
    this.selectedSlot = '';
  }

  protected findSlots(): void {
    if (!this.selectedServiceId || !this.selectedEmployeeId || !this.selectedDate) {
      this.toastService.warning('Seleziona servizio, professionista e data');
      return;
    }

    this.searchingSlots.set(true);
    this.resetAvailability();

    this.customerAreaService
      .findBookingSlots({
        salonProductId: this.selectedServiceId,
        employeeId: this.selectedEmployeeId,
        date: this.selectedDate,
      })
      .subscribe({
        next: (slots) => {
          this.slots.set(slots);
          this.searchingSlots.set(false);

          if (slots.length === 0) {
            this.toastService.info('Nessuno slot libero nella data selezionata');
          }
        },
        error: (error: HttpErrorResponse) => {
          this.searchingSlots.set(false);
          this.toastService.error(this.errorText(error, 'Ricerca disponibilità non riuscita'));
        },
      });
  }

  protected async bookSelectedSlot(): Promise<void> {
    if (!this.selectedServiceId || !this.selectedEmployeeId || !this.selectedSlot) {
      this.toastService.warning('Seleziona uno degli orari disponibili');
      return;
    }

    const service = this.area()?.services.find((item) => item.id === this.selectedServiceId);
    const employee = this.area()?.employees.find((item) => item.id === this.selectedEmployeeId);

    const confirmed = await this.confirmDialog.confirm({
      title: 'Confermare la prenotazione?',
      message: `${service?.name ?? 'Servizio HairLab'} con ${employee?.firstName ?? ''} ${employee?.lastName ?? ''}. L'appuntamento verrà inserito come prenotato.`,
      confirmLabel: 'Prenota',
      severity: 'default',
    });

    if (!confirmed) {
      return;
    }

    this.booking.set(true);

    this.customerAreaService
      .bookAppointment({
        salonProductId: this.selectedServiceId,
        employeeId: this.selectedEmployeeId,
        startDateTime: this.selectedSlot,
        notes: this.notes.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.booking.set(false);
          this.toastService.success('Appuntamento prenotato correttamente');
          this.resetBookingForm();
          this.loadArea();
        },
        error: (error: HttpErrorResponse) => {
          this.booking.set(false);
          this.toastService.error(this.errorText(error, 'Prenotazione non riuscita'));
          this.findSlots();
        },
      });
  }

  protected async cancelAppointment(appointment: CustomerPortalAppointment): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Annullare l’appuntamento?',
      message: 'L’appuntamento resterà nello storico con stato Annullato.',
      confirmLabel: 'Annulla appuntamento',
      severity: 'warning',
    });

    if (!confirmed) {
      return;
    }

    this.customerAreaService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.toastService.success('Appuntamento annullato');
        this.loadArea();
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.error(this.errorText(error, 'Impossibile annullare l’appuntamento'));
      },
    });
  }

  protected serviceName(): string {
    return (
      this.area()?.services.find((service) => service.id === this.selectedServiceId)?.name ??
      'Servizio non selezionato'
    );
  }

  protected employeeName(): string {
    const employee = this.area()?.employees.find((item) => item.id === this.selectedEmployeeId);
    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : 'Professionista non selezionato';
  }

  private resetBookingForm(): void {
    this.selectedServiceId = null;
    this.selectedEmployeeId = null;
    this.selectedDate = this.toDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000));
    this.notes = '';
    this.resetAvailability();
  }

  private errorText(error: HttpErrorResponse, fallback: string): string {
    return typeof error.error?.message === 'string' ? error.error.message : fallback;
  }

  private toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
