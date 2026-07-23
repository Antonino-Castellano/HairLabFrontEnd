import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  Employee
} from '../../../models/employee';

import {
  AppointmentStatus
} from '../../../models/enums/appointment-status';

import {
  AppointmentTimelineItem
} from '../../../models/appointment-timeline-item';

import {
  AppointmentTimelineService
} from '../../../service/appointment-timeline-service';

import {
  EmployeeService
} from '../../../service/employee-service';

import {
  APPOINTMENT_STATUS_LABELS
} from '../appointment-display';

/**
 * Intervallo libero leggibile.
 */
interface FreeGap {

  start:
    string;

  end:
    string;

  duration:
    number;
}

/**
 * Timeline operatori ottimizzata.
 *
 * Blocco 7:
 *
 * - 1 chiamata appuntamenti;
 * - N chiamate AppointmentItem;
 * - lookup clienti;
 * - lookup servizi.
 *
 * Blocco 8:
 *
 * - 1 chiamata operatori;
 * - 1 chiamata aggregata Timeline.
 *
 * Riduciamo le richieste HTTP
 * e semplifichiamo il componente.
 */
@Component({
  selector:
    'app-appointment-operator-timeline',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl:
    './appointment-operator-timeline.html',
  styleUrl:
    './appointment-operator-timeline.css'
})
export class AppointmentOperatorTimelineComponent
  implements OnChanges, OnDestroy {

  @Input({
    required: true
  })
  selectedDate!: string;

  private readonly timelineService =
    inject(
      AppointmentTimelineService
    );

  private readonly employeeService =
    inject(
      EmployeeService
    );

  /**
   * Aggiorna la linea "Adesso"
   * ogni minuto.
   */
  private clockTimer:
    ReturnType<typeof setInterval> |
    null =
      null;

  protected readonly employees =
    signal<Employee[]>([]);

  protected readonly timelineItems =
    signal<AppointmentTimelineItem[]>([]);

  /**
   * Alias mantenuto per la semantica
   * delle statistiche della vista.
   */
  protected readonly appointmentItems =
    computed(
      () =>
        this.timelineItems()
    );

  /**
   * ID appuntamenti distinti.
   */
  protected readonly blockingAppointments =
    computed(
      () =>
        Array.from(
          new Set(
            this.timelineItems()
              .map(
                item =>
                  item.appointmentId
              )
          )
        )
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly windowStart =
    signal(
      '08:00'
    );

  protected readonly windowEnd =
    signal(
      '20:00'
    );

  /**
   * Timestamp corrente.
   */
  protected readonly nowTimestamp =
    signal(
      Date.now()
    );

  /**
   * Ultimo caricamento dati.
   */
  protected readonly lastUpdatedAt =
    signal<Date | null>(
      null
    );

  protected readonly statusLabels =
    APPOINTMENT_STATUS_LABELS;

  /**
   * Somma del carico reale
   * di tutti gli operatori.
   */
  protected readonly totalScheduledMinutes =
    computed(
      () =>
        this.employees()
          .reduce(
            (
              total,
              employee
            ) =>
              total +
              this.getWorkloadMinutes(
                employee.id
              ),
            0
          )
    );

  ngOnChanges(
    changes:
      SimpleChanges
  ): void {

    if (
      changes['selectedDate'] &&
      this.selectedDate
    ) {

      this.startClock();

      this.loadTimeline();
    }
  }

  ngOnDestroy(): void {

    this.stopClock();
  }

  /**
   * Caricamento ottimizzato.
   *
   * Solo due richieste:
   *
   * - dipendenti attivi;
   * - timeline aggregata.
   */
  protected loadTimeline():
    void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    forkJoin({

      employees:
        this.employeeService
          .getActive(),

      items:
        this.timelineService
          .getDay(
            this.selectedDate
          )

    }).subscribe({

      next: result => {

        this.employees.set(
          result.employees ??
          []
        );

        this.timelineItems.set(
          result.items ??
          []
        );

        this.lastUpdatedAt.set(
          new Date()
        );

        this.nowTimestamp.set(
          Date.now()
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
            'Impossibile caricare la timeline operatori.'
          )
        );
      }
    });
  }

  protected onWindowStartChange(
    event:
      Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.windowStart.set(
      input.value
    );
  }

  protected onWindowEndChange(
    event:
      Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;

    this.windowEnd.set(
      input.value
    );
  }

  protected isWindowValid():
    boolean {

    return (
      this.windowStart() <
      this.windowEnd()
    );
  }

  protected getTimelineHeight():
    number {

    const minutes =
      this.getWindowDurationMinutes();

    return Math.min(
      1100,
      Math.max(
        520,
        Math.round(
          minutes *
          1.05
        )
      )
    );
  }

  protected getTimeTicks():
    string[] {

    if (
      !this.isWindowValid()
    ) {

      return [];
    }

    const start =
      this.timeToMinutes(
        this.windowStart()
      );

    const end =
      this.timeToMinutes(
        this.windowEnd()
      );

    const ticks:
      string[] =
        [];

    let cursor =
      start;

    while (
      cursor <=
      end
    ) {

      ticks.push(
        this.minutesToTime(
          cursor
        )
      );

      cursor +=
        60;
    }

    const endLabel =
      this.minutesToTime(
        end
      );

    if (
      ticks[
        ticks.length - 1
      ] !==
      endLabel
    ) {

      ticks.push(
        endLabel
      );
    }

    return ticks;
  }

  protected getTickTop(
    time:
      string
  ): number {

    const windowStartMinutes =
      this.timeToMinutes(
        this.windowStart()
      );

    const tickMinutes =
      this.timeToMinutes(
        time
      );

    const duration =
      this.getWindowDurationMinutes();

    if (
      duration <= 0
    ) {

      return 0;
    }

    return (
      (
        tickMinutes -
        windowStartMinutes
      ) /
      duration
    ) *
    100;
  }

  /**
   * TRUE solo se:
   *
   * - stiamo guardando oggi;
   * - l'ora attuale rientra
   *   nella finestra visualizzata.
   */
  protected isNowVisible():
    boolean {

    if (
      !this.isWindowValid()
    ) {

      return false;
    }

    const now =
      new Date(
        this.nowTimestamp()
      );

    if (
      this.selectedDate !==
      this.toDateInputValue(
        now
      )
    ) {

      return false;
    }

    const nowMinutes =
      now.getHours() *
      60
      +
      now.getMinutes();

    return (
      nowMinutes >=
        this.timeToMinutes(
          this.windowStart()
        )
      &&
      nowMinutes <=
        this.timeToMinutes(
          this.windowEnd()
        )
    );
  }

  /**
   * Posizione verticale della linea Adesso.
   */
  protected getNowTop():
    number {

    const now =
      new Date(
        this.nowTimestamp()
      );

    return this.getTickTop(
      this.minutesToTime(
        now.getHours() *
        60
        +
        now.getMinutes()
      )
    );
  }

  protected getNowLabel():
    string {

    const now =
      new Date(
        this.nowTimestamp()
      );

    return (
      String(
        now.getHours()
      ).padStart(
        2,
        '0'
      )
      +
      ':'
      +
      String(
        now.getMinutes()
      ).padStart(
        2,
        '0'
      )
    );
  }

  protected getLastUpdatedLabel():
    string {

    const value =
      this.lastUpdatedAt();

    if (
      !value
    ) {

      return '—';
    }

    return (
      String(
        value.getHours()
      ).padStart(
        2,
        '0'
      )
      +
      ':'
      +
      String(
        value.getMinutes()
      ).padStart(
        2,
        '0'
      )
      +
      ':'
      +
      String(
        value.getSeconds()
      ).padStart(
        2,
        '0'
      )
    );
  }

  protected getItemsForEmployee(
    employeeId:
      number |
      undefined
  ): AppointmentTimelineItem[] {

    if (
      !employeeId ||
      !this.isWindowValid()
    ) {

      return [];
    }

    return this.timelineItems()
      .filter(
        item =>
          item.employeeId ===
            employeeId
          &&
          this.itemOverlapsWindow(
            item
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          first.scheduledTime
            .localeCompare(
              second.scheduledTime
            )
      );
  }

  protected getBlockTop(
    item:
      AppointmentTimelineItem
  ): number {

    const start =
      this.getItemStartMinutes(
        item
      );

    const windowStartMinutes =
      this.timeToMinutes(
        this.windowStart()
      );

    const duration =
      this.getWindowDurationMinutes();

    if (
      duration <= 0
    ) {

      return 0;
    }

    const clippedStart =
      Math.max(
        start,
        windowStartMinutes
      );

    return Math.max(
      0,
      Math.min(
        100,
        (
          (
            clippedStart -
            windowStartMinutes
          ) /
          duration
        ) *
        100
      )
    );
  }

  protected getBlockHeight(
    item:
      AppointmentTimelineItem
  ): number {

    const windowStartMinutes =
      this.timeToMinutes(
        this.windowStart()
      );

    const windowEndMinutes =
      this.timeToMinutes(
        this.windowEnd()
      );

    const itemStart =
      this.getItemStartMinutes(
        item
      );

    const itemEnd =
      itemStart +
      item.duration;

    const visibleStart =
      Math.max(
        itemStart,
        windowStartMinutes
      );

    const visibleEnd =
      Math.min(
        itemEnd,
        windowEndMinutes
      );

    const visibleDuration =
      Math.max(
        0,
        visibleEnd -
        visibleStart
      );

    const duration =
      this.getWindowDurationMinutes();

    if (
      duration <= 0
    ) {

      return 0;
    }

    return Math.max(
      2.2,
      (
        visibleDuration /
        duration
      ) *
      100
    );
  }

  protected getCustomerName(
    appointmentId:
      number
  ): string {

    return (
      this.timelineItems()
        .find(
          item =>
            item.appointmentId ===
            appointmentId
        )
        ?.customerName
      ??
      `Appuntamento #${appointmentId}`
    );
  }

  protected getProductName(
    productId:
      number |
      undefined
  ): string {

    if (
      !productId
    ) {

      return 'Servizio non disponibile';
    }

    return (
      this.timelineItems()
        .find(
          item =>
            item.salonProductId ===
            productId
        )
        ?.serviceName
      ??
      `Servizio #${productId}`
    );
  }

  protected getAppointmentStatus(
    appointmentId:
      number
  ):
    AppointmentStatus {

    return (
      this.timelineItems()
        .find(
          item =>
            item.appointmentId ===
            appointmentId
        )
        ?.status
      ??
      AppointmentStatus.BOOKED
    );
  }

  protected getAppointmentStatusLabel(
    appointmentId:
      number
  ): string {

    return this.statusLabels[
      this.getAppointmentStatus(
        appointmentId
      )
    ];
  }

  protected getItemStartLabel(
    item:
      AppointmentTimelineItem
  ): string {

    return item.scheduledTime
      .substring(
        11,
        16
      );
  }

  protected getItemEndLabel(
    item:
      AppointmentTimelineItem
  ): string {

    return this.minutesToTime(
      this.getItemStartMinutes(
        item
      )
      +
      item.duration
    );
  }

  protected getWorkloadMinutes(
    employeeId:
      number |
      undefined
  ): number {

    if (
      !employeeId ||
      !this.isWindowValid()
    ) {

      return 0;
    }

    return this.getMergedIntervals(
      employeeId
    )
      .reduce(
        (
          total,
          interval
        ) =>
          total +
          (
            interval.end -
            interval.start
          ),
        0
      );
  }

  protected getWorkloadPercent(
    employeeId:
      number |
      undefined
  ): number {

    const total =
      this.getWindowDurationMinutes();

    if (
      total <= 0
    ) {

      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (
          this.getWorkloadMinutes(
            employeeId
          ) /
          total
        ) *
        100
      )
    );
  }

  protected getFreeGaps(
    employeeId:
      number |
      undefined
  ): FreeGap[] {

    if (
      !employeeId ||
      !this.isWindowValid()
    ) {

      return [];
    }

    const start =
      this.timeToMinutes(
        this.windowStart()
      );

    const end =
      this.timeToMinutes(
        this.windowEnd()
      );

    const intervals =
      this.getMergedIntervals(
        employeeId
      );

    const gaps:
      FreeGap[] =
        [];

    let cursor =
      start;

    for (
      const interval of intervals
    ) {

      if (
        interval.start >
        cursor
      ) {

        gaps.push({

          start:
            this.minutesToTime(
              cursor
            ),

          end:
            this.minutesToTime(
              interval.start
            ),

          duration:
            interval.start -
            cursor
        });
      }

      cursor =
        Math.max(
          cursor,
          interval.end
        );
    }

    if (
      cursor <
      end
    ) {

      gaps.push({

        start:
          this.minutesToTime(
            cursor
          ),

        end:
          this.minutesToTime(
            end
          ),

        duration:
          end -
          cursor
      });
    }

    return gaps;
  }

  protected formatDuration(
    minutes:
      number
  ): string {

    const hours =
      Math.floor(
        minutes /
        60
      );

    const remaining =
      minutes %
      60;

    if (
      hours === 0
    ) {

      return `${remaining} min`;
    }

    if (
      remaining === 0
    ) {

      return `${hours} h`;
    }

    return `${hours} h ${remaining} min`;
  }

  private getMergedIntervals(
    employeeId:
      number
  ): Array<{
    start: number;
    end: number;
  }> {

    const windowStartMinutes =
      this.timeToMinutes(
        this.windowStart()
      );

    const windowEndMinutes =
      this.timeToMinutes(
        this.windowEnd()
      );

    const intervals =
      this.getItemsForEmployee(
        employeeId
      )
        .map(
          item => {

            const itemStart =
              this.getItemStartMinutes(
                item
              );

            return {

              start:
                Math.max(
                  itemStart,
                  windowStartMinutes
                ),

              end:
                Math.min(
                  itemStart +
                  item.duration,
                  windowEndMinutes
                )
            };
          }
        )
        .filter(
          interval =>
            interval.end >
            interval.start
        )
        .sort(
          (
            first,
            second
          ) =>
            first.start -
            second.start
        );

    const merged:
      Array<{
        start: number;
        end: number;
      }> =
        [];

    for (
      const current of intervals
    ) {

      const last =
        merged[
          merged.length - 1
        ];

      if (
        !last ||
        current.start >
        last.end
      ) {

        merged.push({
          ...current
        });

      } else {

        last.end =
          Math.max(
            last.end,
            current.end
          );
      }
    }

    return merged;
  }

  private itemOverlapsWindow(
    item:
      AppointmentTimelineItem
  ): boolean {

    const start =
      this.getItemStartMinutes(
        item
      );

    const end =
      start +
      item.duration;

    const windowStartMinutes =
      this.timeToMinutes(
        this.windowStart()
      );

    const windowEndMinutes =
      this.timeToMinutes(
        this.windowEnd()
      );

    return (
      start <
        windowEndMinutes
      &&
      end >
        windowStartMinutes
    );
  }

  private getItemStartMinutes(
    item:
      AppointmentTimelineItem
  ): number {

    return this.timeToMinutes(
      item.scheduledTime
        .substring(
          11,
          16
        )
    );
  }

  private getWindowDurationMinutes():
    number {

    if (
      !this.isWindowValid()
    ) {

      return 0;
    }

    return (
      this.timeToMinutes(
        this.windowEnd()
      )
      -
      this.timeToMinutes(
        this.windowStart()
      )
    );
  }

  private startClock():
    void {

    this.stopClock();

    this.nowTimestamp.set(
      Date.now()
    );

    if (
      typeof window ===
      'undefined'
    ) {

      return;
    }

    this.clockTimer =
      window.setInterval(
        () => {

          this.nowTimestamp.set(
            Date.now()
          );
        },
        60_000
      );
  }

  private stopClock():
    void {

    if (
      this.clockTimer
    ) {

      clearInterval(
        this.clockTimer
      );

      this.clockTimer =
        null;
    }
  }

  private timeToMinutes(
    time:
      string
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
      hours *
      60
      +
      minutes
    );
  }

  private minutesToTime(
    value:
      number
  ): string {

    const normalized =
      (
        value %
        (
          24 *
          60
        )
        +
        (
          24 *
          60
        )
      )
      %
      (
        24 *
        60
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
      )
      +
      ':'
      +
      String(
        minutes
      ).padStart(
        2,
        '0'
      )
    );
  }

  private toDateInputValue(
    date:
      Date
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
    error:
      HttpErrorResponse,
    fallback:
      string
  ): string {

    const backendMessage =
      error.error?.message;

    if (
      typeof backendMessage ===
        'string'
      &&
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
