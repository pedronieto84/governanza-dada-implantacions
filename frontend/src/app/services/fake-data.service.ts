import { Injectable, signal } from '@angular/core';

/**
 * Punt centralitzat per activar/desactivar el botó "Fake data" a tota l'aplicació.
 * Per amagar el botó pertot arreu n'hi ha prou amb posar `enabled` a `false`.
 */
@Injectable({ providedIn: 'root' })
export class FakeDataService {
  private readonly enabledSignal = signal(true);
  readonly enabled = this.enabledSignal.asReadonly();

  setEnabled(value: boolean): void {
    this.enabledSignal.set(value);
  }
}
