import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';

type SortDir = 'asc' | 'desc' | null;

@Component({
  selector: 'app-relacion-atributs',
  imports: [FormsModule, StickyStackDirective],
  templateUrl: './relacion-atributs.html',
  styleUrl: './relacion-atributs.css',
})
export class RelacionAtributs {
  dades = [
    { atributOrigen: 'B.1', atributDesti: 'A.5', tipusRelacio: 'Relació jeràrquica (l\'atribut origen domina l\'atribut de destinació)', entitatOrigen: 'Interessats', sistemaOrigen: '0', entitatDesti: 'Habitants', sistemaDesti: '0' }
  ];

  sortColumn: string | null = null;
  sortDirection: SortDir = null;

  filters: Record<string, string> = {
    atributOrigen: '',
    atributDesti: '',
    tipusRelacio: '',
    entitatOrigen: '',
    sistemaOrigen: '',
    entitatDesti: '',
    sistemaDesti: '',
  };

  sort(col: string): void {
    if (this.sortColumn === col) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortColumn = null;
        this.sortDirection = null;
      }
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  get filteredDades() {
    const cols = ['atributOrigen', 'atributDesti', 'tipusRelacio', 'entitatOrigen', 'sistemaOrigen', 'entitatDesti', 'sistemaDesti'];
    let result = this.dades.filter(item =>
      cols.every(col =>
        (item as any)[col].toString().toLowerCase().includes(this.filters[col].toLowerCase())
      )
    );
    if (this.sortColumn && this.sortDirection) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      const col = this.sortColumn;
      result = [...result].sort((a, b) =>
        (a as any)[col].toString().localeCompare((b as any)[col].toString()) * dir
      );
    }
    return result;
  }
}
