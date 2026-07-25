import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerArea } from '../../models/customer-area';
import { AppointmentStatus } from '../../models/enums/appointment-status';
import { CustomerAreaService } from '../../service/customer-area-service';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-customer-area',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './customer-area.html',
  styleUrl: './customer-area.css',
})
export class CustomerAreaComponent implements OnInit {
  private readonly customerAreaService = inject(CustomerAreaService);
  private readonly toastService = inject(ToastService);

  protected readonly area = signal<CustomerArea | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly appointmentStatusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.BOOKED]: 'Prenotato',
    [AppointmentStatus.CONFIRMED]: 'Confermato',
    [AppointmentStatus.IN_PROGRESS]: 'In corso',
    [AppointmentStatus.COMPLETED]: 'Completato',
    [AppointmentStatus.CANCELLED]: 'Annullato',
    [AppointmentStatus.NO_SHOW]: 'Non presentato',
  };

  protected readonly nextAppointment = computed(() => {
    const now = Date.now();

    return (this.area()?.appointmentDetails ?? [])
      .filter(
        (appointment) =>
          new Date(appointment.startDateTime).getTime() >= now &&
          appointment.status !== AppointmentStatus.CANCELLED &&
          appointment.status !== AppointmentStatus.NO_SHOW,
      )
      .sort(
        (first, second) =>
          new Date(first.startDateTime).getTime() - new Date(second.startDateTime).getTime(),
      )[0];
  });

  protected readonly upcomingCount = computed(
    () =>
      (this.area()?.appointmentDetails ?? []).filter(
        (appointment) =>
          new Date(appointment.startDateTime).getTime() >= Date.now() &&
          appointment.status !== AppointmentStatus.CANCELLED &&
          appointment.status !== AppointmentStatus.NO_SHOW,
      ).length,
  );

  protected readonly profileCompletion = computed(() => {
    const analysis = this.area()?.analysis;

    if (!analysis) {
      return 0;
    }

    const completed = [analysis.hairProfile, analysis.faceProfile, analysis.colorAnalysis].filter(
      Boolean,
    ).length;

    return Math.round((completed / 3) * 100);
  });

  ngOnInit(): void {
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
        this.errorMessage.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'Impossibile caricare la tua dashboard.',
        );
        this.toastService.error('Dashboard cliente non disponibile');
      },
    });
  }

  protected getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
