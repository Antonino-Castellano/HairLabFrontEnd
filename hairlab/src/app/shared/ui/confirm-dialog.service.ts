import { Injectable, signal } from '@angular/core';

export type ConfirmDialogSeverity = 'default' | 'warning' | 'danger';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: ConfirmDialogSeverity;
}

export interface ConfirmDialogState extends Required<ConfirmDialogOptions> {
  resolve: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState | null>(null);

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    if (this.state()) {
      this.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      this.state.set({
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Conferma',
        cancelLabel: options.cancelLabel ?? 'Annulla',
        severity: options.severity ?? 'default',
        resolve,
      });
    });
  }

  resolve(confirmed: boolean): void {
    const current = this.state();
    if (!current) return;

    this.state.set(null);
    current.resolve(confirmed);
  }
}
