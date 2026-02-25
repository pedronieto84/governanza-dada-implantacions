import { Component } from '@angular/core';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.html',
  styleUrl: './informes.css',
  standalone: true
})
export class Informes {
  dades = [
    { nom: 'Habitants', quadresCmd: 'SÍ', refTecnic: '', emailRef: '', unitatRef: '', arqDada: '', emailArq: '', unitatArq: '', obs: '' },
    { nom: 'Interessats', quadresCmd: '', refTecnic: '', emailRef: '', unitatRef: '', arqDada: '', emailArq: '', unitatArq: '', obs: '' },
    { nom: 'Obligats', quadresCmd: '', refTecnic: '', emailRef: '', unitatRef: '', arqDada: '', emailArq: '', unitatArq: '', obs: '' },
    { nom: 'Tercers', quadresCmd: '', refTecnic: '', emailRef: '', unitatRef: '', arqDada: '', emailArq: '', unitatArq: '', obs: '' }
  ];
}
