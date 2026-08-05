import { Injectable, computed, signal } from '@angular/core';

export type AppMode = 'DEV' | 'PROD';

const STORAGE_KEY = 'app-mode';

/**
 * Modo global de la app (DEV/PROD), seleccionable desde la cabecera.
 * DEV es el modo por defecto: habilita "Fake data" en toda la app y
 * permite acceder a la sección Admin y a las páginas sin pasar por login,
 * para facilitar el webscraping/testing automatizado.
 */
@Injectable({ providedIn: 'root' })
export class AppModeService {
  private readonly modeSignal = signal<AppMode>(this.readInitialMode());
  readonly mode = this.modeSignal.asReadonly();
  readonly isDev = computed(() => this.modeSignal() === 'DEV');

  setMode(mode: AppMode): void {
    this.modeSignal.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage no disponible (SSR u otros): ignorar.
    }
  }

  private readInitialMode(): AppMode {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'PROD' ? 'PROD' : 'DEV';
    } catch {
      return 'DEV';
    }
  }
}
