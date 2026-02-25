import { Component } from '@angular/core';

@Component({
  selector: 'app-fuentes-destinos',
  templateUrl: './fuentes-destinos.html',
  styleUrl: './fuentes-destinos.css',
  standalone: true
})
export class FuentesDestinos {
  dades = [
    { nom: 'Habitants', intraOp: 'SÍ', interOp: 'SÍ', interes: 'SÍ', obertura: 'No obert, es podria obrir/s\'obrirà', restriccions: '', entitatUnica: 'NO', llenguatges: 'SÍ', completesHist: '', completesActuals: '', enviaments: '', criticat: 'SÍ' },
    { nom: 'Interessats', intraOp: 'NO', interOp: 'NO', interes: '', obertura: 'No obert, es podria obrir/s\'obrirà parcialment', restriccions: 'NO', entitatUnica: 'NO', llenguatges: '', completesHist: '', completesActuals: '', enviaments: '', criticat: '' },
    { nom: 'Obligats', intraOp: 'NO', interOp: 'NO', interes: '', obertura: '', restriccions: '', entitatUnica: '', llenguatges: '', completesHist: '', completesActuals: '', enviaments: '', criticat: '' },
    { nom: 'Tercers', intraOp: 'NO', interOp: '', interes: '', obertura: '', restriccions: '', entitatUnica: '', llenguatges: '', completesHist: '', completesActuals: '', enviaments: '', criticat: '' }
  ];
}
