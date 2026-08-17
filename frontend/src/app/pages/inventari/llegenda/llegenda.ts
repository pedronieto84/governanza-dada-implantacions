import { Component } from '@angular/core';
import { INVENTARI_SHEETS } from '../inventari-3b.model';

@Component({
  selector: 'app-llegenda',
  imports: [],
  templateUrl: './llegenda.html',
  styleUrl: './llegenda.css',
})
export class Llegenda {
  readonly sections = Object.values(INVENTARI_SHEETS);
}
