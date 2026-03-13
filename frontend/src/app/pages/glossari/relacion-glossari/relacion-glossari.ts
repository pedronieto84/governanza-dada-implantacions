import { Component } from '@angular/core';

@Component({
  selector: 'app-relacion-glossari',
  imports: [],
  templateUrl: './relacion-glossari.html',
  styleUrl: './relacion-glossari.css',
})
export class RelacionGlossari {
  relacions = [
    {
      termeOrigen: 'Interessat',
      termeRelacionat: 'b',
      tipusRelacio: 'Correspondència (Terme similar que pot tenir variacions en diferents departaments o sistemes)'
    },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
  ];
}
