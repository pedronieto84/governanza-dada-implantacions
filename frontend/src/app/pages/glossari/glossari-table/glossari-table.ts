import { Component } from '@angular/core';

export interface GlossariRow {
  terme: string;
  descripcio: string;
  dominiFuncional: string;
  tipus: string;
  descFormat: string;
  formula: string;
  comentaris: string;
  alies: string;
  refGovern: string;
  emailRefGov: string;
  unitatRefGov: string;
  respFuncional: string;
  emailRespFunc: string;
  unitatRespFunc: string;
}

@Component({
  selector: 'app-glossari-table',
  imports: [],
  templateUrl: './glossari-table.html',
  styleUrl: './glossari-table.css',
})
export class GlossariTable {
  activeTab: 'mestres' | 'referencia' | 'negoci' = 'mestres';

  readonly emptyRow: GlossariRow = {
    terme: '', descripcio: '', dominiFuncional: '', tipus: '',
    descFormat: '', formula: '', comentaris: '', alies: '',
    refGovern: '', emailRefGov: '', unitatRefGov: '',
    respFuncional: '', emailRespFunc: '', unitatRespFunc: ''
  };

  dadesMestres: GlossariRow[] = [
    {
      terme: 'Interessat', descripcio: '', dominiFuncional: '', tipus: '',
      descFormat: '', formula: '', comentaris: '',
      alies: 'ciutadà, habitant, tercer, obligat',
      refGovern: '', emailRefGov: '', unitatRefGov: '',
      respFuncional: '', emailRespFunc: '', unitatRespFunc: ''
    },
    { ...this.emptyRow, terme: 'b' },
    { ...this.emptyRow, terme: 'c' },
    { ...this.emptyRow, terme: 'd' },
    { ...this.emptyRow, terme: 'e' },
    { ...this.emptyRow, terme: 'f' },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
  ];

  dadesReferencia: GlossariRow[] = [
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
  ];

  dadesNegoci: GlossariRow[] = [
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
    { ...this.emptyRow },
  ];
}
