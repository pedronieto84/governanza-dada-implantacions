import { Component } from '@angular/core';

@Component({
  selector: 'app-model-dades',
  templateUrl: './model-dades.html',
  styleUrl: './model-dades.css',
  standalone: true
})
export class ModelDades {
  relacions = [
    { atrOrigen: '8.1', atrDesti: 'A.5', tipus: 'Relació jeràrquica (l\'atribut origen d...', entitatOrigen: 'Interessats', sistemaOrigen: '0', entitatDesti: 'Habitants', sistemaDesti: '0' },
    { atrOrigen: '', atrDesti: '', tipus: '', entitatOrigen: '', sistemaOrigen: '', entitatDesti: '', sistemaDesti: '' },
    { atrOrigen: '', atrDesti: '', tipus: '', entitatOrigen: '', sistemaOrigen: '', entitatDesti: '', sistemaDesti: '' }
  ];
}
