import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

const SUCCESS_DURATION_MS = 3000;
const ERROR_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string = 'Dades guardades correctament', duration = SUCCESS_DURATION_MS): void {
    this.push('success', message, duration);
  }

  error(message: string, duration = ERROR_DURATION_MS): void {
    this.push('error', message, duration);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: ToastType, message: string, duration: number): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
