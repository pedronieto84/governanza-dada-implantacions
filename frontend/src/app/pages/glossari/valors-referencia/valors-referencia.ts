import { Component } from '@angular/core';

@Component({
  selector: 'app-valors-referencia',
  templateUrl: './valors-referencia.html',
  styleUrl: './valors-referencia.css',
  standalone: true
})
export class ValorsReferencia {
  relacions = [
    { origen: 'Interessat', relacionat: 'c', tipus: 'Correspondència (Terme similar que pot tenir variacions en diferents departaments o sistemes)' },
    { origen: '', relacionat: '', tipus: '' },
    { origen: '', relacionat: '', tipus: '' }
  ];
}
