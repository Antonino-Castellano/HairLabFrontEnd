import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly nextId = signal(1);
  readonly messages = signal<ToastMessage[]>([]);

  success(title: string, message?: string, duration = 3800): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 5200): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 4600): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 4000): void {
    this.show('info', title, message, duration);
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private show(type: ToastType, title: string, message?: string, duration = 4000): void {
    const id = this.nextId();
    this.nextId.update((value) => value + 1);

    this.messages.update((messages) => [
      ...messages,
      {
        id,
        type,
        title,
        message,
        duration,
      },
    ]);

    if (duration > 0) {
      window.setTimeout(() => this.dismiss(id), duration);
    }
  }
}
