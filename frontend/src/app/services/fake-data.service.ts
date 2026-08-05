import { Injectable, computed, inject } from '@angular/core';
import { AppModeService } from './app-mode.service';

/**
 * Punt centralitzat per activar/desactivar el botó "Fake data" a tota l'aplicació.
 * Visible sempre que l'app estigui en mode DEV (veure `AppModeService`).
 */
@Injectable({ providedIn: 'root' })
export class FakeDataService {
  private readonly appMode = inject(AppModeService);
  readonly enabled = computed(() => this.appMode.isDev());
}
