import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { StickyStackDirective } from '../../../shared/sticky-stack.directive';
import {
  INVENTARI_SHEETS,
  InventariCollection,
  InventariColumn,
  InventariRow,
  riskGrade,
  RISK_KEYS,
} from '../inventari-3b.model';
import { Inventari3bService } from '../inventari-3b.service';

@Component({
  selector: 'app-taula-inventari',
  imports: [FormsModule, StickyStackDirective],
  templateUrl: './taula-inventari.html',
  styleUrl: './taula-inventari.css',
})
export class TaulaInventari {
  private readonly route = inject(ActivatedRoute);
  readonly inventari = inject(Inventari3bService);

  readonly collection = this.route.snapshot.data['collection'] as InventariCollection;
  readonly config = INVENTARI_SHEETS[this.collection];
  readonly rows = computed(() => this.inventari.data()[this.collection]);
  readonly loading = this.inventari.loading;

  options(column: InventariColumn): readonly string[] {
    if (column.key === 'domini') {
      return this.inventari.data().dominis.map((row) => row['nom']).filter(Boolean);
    }
    if (column.key === 'conjunt') {
      return this.inventari.data().conjunts.map((row) => row['nom']).filter(Boolean);
    }
    if (column.key === 'sistema') {
      return this.inventari.data().sistemes.map((row) => row['nom']).filter(Boolean);
    }
    return column.options ?? [];
  }

  value(row: InventariRow, column: InventariColumn): string {
    if (column.type !== 'computed') return row[column.key] ?? '';
    const data = this.inventari.data();

    if (column.key === 'nombreConjunts') {
      if (this.collection === 'sistemes') {
        return String(data.relacions.filter((relacio) => relacio['sistema'] === row['nom']).length);
      }
      return String(data.conjunts.filter((conjunt) => conjunt['domini'] === row['nom']).length);
    }
    if (column.key === 'areaPropietaria') {
      return data.dominis.find((domini) => domini['nom'] === row['domini'])?.['areaPropietaria'] ?? '-';
    }
    if (column.key === 'nivellRisc') {
      const total = RISK_KEYS.reduce((sum, key) => sum + riskGrade(row[key] ?? ''), 0);
      return (total / RISK_KEYS.length).toFixed(2);
    }
    if (column.key === 'nombreSistemes') {
      return String(data.relacions.filter((relacio) => relacio['conjunt'] === row['nom']).length);
    }
    if (column.key === 'nombreDominis') {
      return row['domini'] && data.dominis.some((domini) => domini['nom'] === row['domini']) ? '1' : '0';
    }
    if (column.key === 'controlConjunt') {
      return this.control(row['conjunt'], data.conjunts, 'Conjunt de dades erroni');
    }
    if (column.key === 'controlSistema') {
      return this.control(row['sistema'], data.sistemes, "Sistema d'informació erroni");
    }
    if (column.key === 'controlRelacio') {
      const conjuntOk = this.control(row['conjunt'], data.conjunts, '') === 'OK';
      const sistemaOk = this.control(row['sistema'], data.sistemes, '') === 'OK';
      return !row['conjunt'] && !row['sistema'] ? '' : conjuntOk && sistemaOk ? 'OK' : 'Error';
    }
    return '';
  }

  update(index: number, key: string, value: string): void {
    this.inventari.update(this.collection, index, key, value);
  }

  add(): void {
    this.inventari.add(this.collection);
  }

  remove(index: number): void {
    this.inventari.remove(this.collection, index);
  }

  private control(value: string, rows: InventariRow[], error: string): string {
    if (!value) return '';
    return rows.some((row) => row['nom'] === value) ? 'OK' : error;
  }
}