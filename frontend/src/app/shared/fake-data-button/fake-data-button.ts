import { Component, EventEmitter, Output } from '@angular/core';

import { FakeDataService } from '../../services/fake-data.service';

/**
 * Botó reutilitzable per omplir taules/formularis amb dades falses versemblants.
 * Es pot activar/desactivar pertot arreu des d'un únic punt: `FakeDataService`.
 */
@Component({
  selector: 'app-fake-data-button',
  template: `
    @if (fakeDataService.enabled()) {
      <button type="button" class="btn btn-outline shrink-0" (click)="fill.emit()">Fake data</button>
    }
  `,
})
export class FakeDataButton {
  @Output() fill = new EventEmitter<void>();

  constructor(readonly fakeDataService: FakeDataService) {}
}
