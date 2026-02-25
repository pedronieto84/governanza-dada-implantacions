import { Component } from '@angular/core';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
  standalone: true
})
export class Formulario {
  preguntas = [
    {
      id: 'GA01',
      respostes: [
        'No, no existeix un marc de Govern de la dada establert',
        'Sí, però cada Àrea identifica i desenvolupa els seus processos amb el seu propi criteri',
        'Sí, hi ha un marc de Govern de la dada establert i publicat, que coneixen i utilitzen les diferents Àrees',
        'Sí, hi ha un marc de Govern de la dada establert i publicat... i que està subjecte a processos de millora'
      ],
      accions: [
        'Definir un Marc de Treball',
        'Establir un marc de...',
        'Assegurar la aplicació...',
        ''
      ],
      ambit: 'Govern',
      proces: 'Establiment d\'estàndards, polítiques, bones pràctiques i procediments',
      plaAccio: '2- Establir un marc de Govern del Dada unificat...',
      prioritat: 2,
      calendari: ''
    },
    {
      id: 'GA02',
      respostes: [
        'No, no hi ha polítiques per a la optimització del valor de les dades',
        'Sí, hi ha algunes polítiques, però no s\'implementen adequadament',
        'Sí, hi ha polítiques per a la optimització del valor de les dades i s\'implementen adequadament',
        'Sí, hi ha polítiques... s\'implementen adequadament, i es porten a terme accions periòdiques'
      ],
      accions: [
        'Cal definir la Política',
        'Cal revisar que les Polítiques',
        'És recomanable revisar',
        ''
      ],
      ambit: 'Govern',
      proces: 'Establiment d\'estàndards, polítiques, bones pràctiques i procediments',
      plaAccio: '2- Cal revisar que les Polítiques definides son aplicables...',
      prioritat: 2,
      calendari: ''
    }
  ];
}
