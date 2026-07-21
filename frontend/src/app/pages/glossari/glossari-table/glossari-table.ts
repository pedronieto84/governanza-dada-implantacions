import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';

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
  imports: [AgGridAngular],
  templateUrl: './glossari-table.html',
  styleUrl: './glossari-table.css',
})
export class GlossariTable {
  activeTab: 'mestres' | 'referencia' | 'negoci' = 'mestres';
  private gridApi!: GridApi;

  colDefs: ColDef[] = [
    { field: 'terme', headerName: 'Terme de glossari', editable: true, sortable: true, filter: true },
    { field: 'descripcio', headerName: 'Descripció', editable: true, sortable: true, filter: true },
    { field: 'dominiFuncional', headerName: 'Domini funcional principal', editable: true, sortable: true, filter: true },
    { field: 'tipus', headerName: 'Tipus', editable: true, sortable: true, filter: true },
    { field: 'descFormat', headerName: 'Descripció de format', editable: true, sortable: true, filter: true },
    { field: 'formula', headerName: 'Fórmula de càlcul (mètrica)', editable: true, sortable: true, filter: true },
    { field: 'comentaris', headerName: 'Comentaris', editable: true, sortable: true, filter: true },
    { field: 'alies', headerName: "Noms d'àlies", editable: true, sortable: true, filter: true },
    { field: 'refGovern', headerName: 'Referent de Govern', editable: true, sortable: true, filter: true },
    { field: 'emailRefGov', headerName: 'Correu electrònic del Referent de Govern', editable: true, sortable: true, filter: true },
    { field: 'unitatRefGov', headerName: 'Unitat Orgànica Referent de Govern', editable: true, sortable: true, filter: true },
    { field: 'respFuncional', headerName: 'Responsable Funcional', editable: true, sortable: true, filter: true },
    { field: 'emailRespFunc', headerName: 'Correu electrònic del Responsable Funcional', editable: true, sortable: true, filter: true },
    { field: 'unitatRespFunc', headerName: 'Unitat orgànica Responsable Funcional', editable: true, sortable: true, filter: true },
    {
      headerName: 'Accions',
      cellRenderer: (params: any) => {
        const eDiv = document.createElement('div');
        eDiv.innerHTML = `<button class="btn btn-error btn-xs">Eliminar</button>`;
        eDiv.querySelector('button')?.addEventListener('click', () => {
          this.removeRow(params.node.data);
        });
        return eDiv;
      },
      editable: false,
      filter: false,
      sortable: false,
      width: 100
    }
  ];

  defaultColDef: ColDef = {
    minWidth: 150,
    resizable: true,
  };

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

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  addRow() {
    const newRow = { ...this.emptyRow };
    if (this.activeTab === 'mestres') {
      this.dadesMestres = [...this.dadesMestres, newRow];
    } else if (this.activeTab === 'referencia') {
      this.dadesReferencia = [...this.dadesReferencia, newRow];
    } else {
      this.dadesNegoci = [...this.dadesNegoci, newRow];
    }
  }

  removeRow(data: GlossariRow) {
    if (this.activeTab === 'mestres') {
      this.dadesMestres = this.dadesMestres.filter(row => row !== data);
    } else if (this.activeTab === 'referencia') {
      this.dadesReferencia = this.dadesReferencia.filter(row => row !== data);
    } else {
      this.dadesNegoci = this.dadesNegoci.filter(row => row !== data);
    }
  }

  get currentData(): GlossariRow[] {
    switch (this.activeTab) {
      case 'mestres': return this.dadesMestres;
      case 'referencia': return this.dadesReferencia;
      case 'negoci': return this.dadesNegoci;
    }
  }
}
