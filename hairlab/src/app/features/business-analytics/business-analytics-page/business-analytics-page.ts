import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsPreset, BusinessAnalyticsDashboard } from '../../../models/business-analytics';
import { BusinessAnalyticsService } from '../../../service/business-analytics-service';

@Component({
  selector: 'app-business-analytics-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './business-analytics-page.html',
  styleUrl: './business-analytics-page.css',
})
export class BusinessAnalyticsPageComponent implements OnInit {
  private readonly service = inject(BusinessAnalyticsService);

  protected readonly dashboard = signal<BusinessAnalyticsDashboard | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly preset = signal<AnalyticsPreset>('MONTHLY');
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');

  protected readonly presets: Array<{ value: AnalyticsPreset; label: string }> = [
    { value: 'MONTHLY', label: 'Mensile' },
    { value: 'QUARTERLY', label: 'Trimestrale' },
    { value: 'SEMIANNUAL', label: 'Semestrale' },
    { value: 'ANNUAL', label: 'Annuale' },
    { value: 'CUSTOM', label: 'Intervallo personalizzato' },
  ];

  protected readonly maxTrendRevenue = computed(() =>
    Math.max(...(this.dashboard()?.trend.map((point) => point.revenue) ?? [0]), 1),
  );
  protected readonly maxServiceUsage = computed(() =>
    Math.max(...(this.dashboard()?.topServices.map((row) => row.usageCount) ?? [0]), 1),
  );
  protected readonly maxCustomerSpend = computed(() =>
    Math.max(...(this.dashboard()?.topCustomers.map((row) => row.totalSpent) ?? [0]), 1),
  );
  protected readonly maxHourAppointments = computed(() =>
    Math.max(...(this.dashboard()?.peakHours.map((row) => row.appointmentCount) ?? [0]), 1),
  );
  protected readonly maxColorQuantity = computed(() =>
    Math.max(...(this.dashboard()?.topColors.map((row) => row.totalQuantity) ?? [0]), 1),
  );

  ngOnInit(): void {
    this.applyPreset('MONTHLY');
  }

  protected applyPreset(value: AnalyticsPreset): void {
    this.preset.set(value);
    if (value === 'CUSTOM') return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    let start: Date;
    let end: Date;

    if (value === 'MONTHLY') {
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
    } else if (value === 'QUARTERLY') {
      const quarterStart = Math.floor(month / 3) * 3;
      start = new Date(year, quarterStart, 1);
      end = new Date(year, quarterStart + 3, 0);
    } else if (value === 'SEMIANNUAL') {
      const semesterStart = month < 6 ? 0 : 6;
      start = new Date(year, semesterStart, 1);
      end = new Date(year, semesterStart + 6, 0);
    } else {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
    }

    this.startDate.set(this.formatDate(start));
    this.endDate.set(this.formatDate(end));
    this.load();
  }

  protected updateStart(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
    this.preset.set('CUSTOM');
  }

  protected updateEnd(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
    this.preset.set('CUSTOM');
  }

  protected load(): void {
    if (!this.startDate() || !this.endDate()) {
      this.errorMessage.set('Seleziona una data iniziale e una data finale.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.service.getDashboard(this.startDate(), this.endDate(), this.preset()).subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile caricare le statistiche del salone.',
        );
        this.loading.set(false);
      },
    });
  }

  protected trendHeight(value: number): number {
    return Math.max(4, Math.round((Math.max(0, value) / this.maxTrendRevenue()) * 100));
  }

  protected serviceWidth(value: number): number {
    return Math.max(2, Math.round((Math.max(0, value) / this.maxServiceUsage()) * 100));
  }

  protected customerWidth(value: number): number {
    return Math.max(2, Math.round((Math.max(0, value) / this.maxCustomerSpend()) * 100));
  }

  protected hourWidth(value: number): number {
    return Math.max(2, Math.round((Math.max(0, value) / this.maxHourAppointments()) * 100));
  }

  protected colorWidth(value: number): number {
    return Math.max(2, Math.round((Math.max(0, value) / this.maxColorQuantity()) * 100));
  }

  protected statusLabel(status: string): string {
    const labels: Record<string, string> = {
      BOOKED: 'Prenotati',
      CONFIRMED: 'Confermati',
      IN_PROGRESS: 'In corso',
      COMPLETED: 'Completati',
      CANCELLED: 'Annullati',
      NO_SHOW: 'Non presentati',
    };
    return labels[status] ?? status;
  }

  protected unitLabel(unit?: string | null): string {
    const labels: Record<string, string> = {
      GRAM: 'g',
      GRAMS: 'g',
      MILLILITER: 'ml',
      MILLILITERS: 'ml',
      PIECE: 'pz',
      PIECES: 'pz',
      MISTO: 'unità miste',
    };
    return unit ? (labels[unit] ?? unit.toLowerCase()) : '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
