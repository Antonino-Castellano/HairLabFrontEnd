import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { Appointment } from '../../../models/appointment';
import { CustomerAnalysis } from '../../../models/customer-analysis';
import { ColorFormulaCustomerHistory } from '../../../models/color-formula-history';
import { ColorLearningInsight } from '../../../models/color-learning-insight';
import { AppointmentStatus } from '../../../models/enums/appointment-status';
import { CustomerAnalysisService } from '../../../service/customer-analysis-service';
import { AppointmentService } from '../../../service/appointment-service';
import { ColorFormulaHistoryService } from '../../../service/color-formula-history-service';
import { ColorLearningInsightService } from '../../../service/color-learning-insight-service';
import { TONE_LEVEL_LABELS, REFLECTION_LABELS } from '../../color-lab/color-lab-display';
import { COLOR_FORMULA_STATUS_LABELS } from '../../color-lab/color-formula-display';
import { APPOINTMENT_STATUS_LABELS } from '../../appointments/appointment-display';

interface TechnicalTimelineItem {
  kind: 'FORMULA' | 'APPOINTMENT';
  date: string;
  title: string;
  subtitle: string;
  status: string;
  formulaId?: number;
  appointmentId?: number;
}

@Component({
  selector: 'app-customer-color-technical-record',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './customer-color-technical-record.html',
  styleUrl: './customer-color-technical-record.css'
})
export class CustomerColorTechnicalRecordComponent implements OnChanges {

  @Input({ required: true }) customerId!: number;

  private readonly customerAnalysisService = inject(CustomerAnalysisService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly formulaHistoryService = inject(ColorFormulaHistoryService);
  private readonly learningService = inject(ColorLearningInsightService);

  protected readonly analysis = signal<CustomerAnalysis | null>(null);
  protected readonly formulaHistory = signal<ColorFormulaCustomerHistory | null>(null);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly learningInsight = signal<ColorLearningInsight | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly toneLabels = TONE_LEVEL_LABELS;
  protected readonly reflectionLabels = REFLECTION_LABELS;

  protected readonly completedAppointments = computed(() =>
    this.appointments().filter(item => item.status === AppointmentStatus.COMPLETED).length
  );

  protected readonly upcomingAppointments = computed(() =>
    this.appointments().filter(item =>
      item.status === AppointmentStatus.BOOKED ||
      item.status === AppointmentStatus.CONFIRMED ||
      item.status === AppointmentStatus.IN_PROGRESS
    ).length
  );

  protected readonly referenceFormula = computed(() => {
    const history = this.formulaHistory();
    if (!history?.referenceFormulaId) return null;
    return history.items.find(item => item.formula.id === history.referenceFormulaId) ?? null;
  });

  protected readonly timeline = computed<TechnicalTimelineItem[]>(() => {
    const items: TechnicalTimelineItem[] = [];
    const history = this.formulaHistory();

    for (const entry of history?.items ?? []) {
      const formula = entry.formula;
      const date = entry.usage?.usedAt ?? formula.createdAt;
      if (!date) continue;
      items.push({
        kind: 'FORMULA',
        date,
        title: formula.name,
        subtitle: entry.result
          ? `Risultato: ${entry.result.assessment}`
          : formula.targetResult,
        status: formula.referenceFormula
          ? 'Formula di riferimento'
          : COLOR_FORMULA_STATUS_LABELS[formula.status],
        formulaId: formula.id
      });
    }

    for (const appointment of this.appointments()) {
      if (!appointment.startDateTime) continue;
      items.push({
        kind: 'APPOINTMENT',
        date: appointment.startDateTime,
        title: 'Appuntamento salone',
        subtitle: appointment.notes || 'Nessuna nota appuntamento',
        status: APPOINTMENT_STATUS_LABELS[appointment.status],
        appointmentId: appointment.id
      });
    }

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] && this.customerId > 0) {
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      analysis: this.customerAnalysisService.getByCustomerId(this.customerId),
      formulas: this.formulaHistoryService.getByCustomerId(this.customerId),
      appointments: this.appointmentService.getByCustomerId(this.customerId),
      learning: this.learningService.getByCustomerId(this.customerId).pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: result => {
        this.analysis.set(result.analysis);
        this.formulaHistory.set(result.formulas);
        this.appointments.set(result.appointments ?? []);
        this.learningInsight.set(result.learning);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message ?? 'Impossibile caricare la cartella tecnica colore.'
        );
      }
    });
  }
}
