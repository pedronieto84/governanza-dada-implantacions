import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';
import { environment } from '../../../../environments/environment';

interface RelacioGlossariRow {
  termeOrigen: string;
  termeRelacionat: string;
  tipusRelacio: string;
}

type RelacioColumn = {
  key: keyof RelacioGlossariRow;
  label: string;
};

@Component({
  selector: 'app-relacion-glossari',
  imports: [FormsModule],
  templateUrl: './relacion-glossari.html',
  styleUrl: './relacion-glossari.css',
})
export class RelacionGlossari implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly saveRequest$ = new Subject<void>();
  private municipiActual = '';

  isLoading = false;
  filterText = '';
  sortColumn: keyof RelacioGlossariRow | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  readonly columns: RelacioColumn[] = [
    { key: 'termeOrigen', label: "Terme d'origen" },
    { key: 'termeRelacionat', label: 'Terme relacionat' },
    { key: 'tipusRelacio', label: 'Tipus de relació' },
  ];

  relacions: RelacioGlossariRow[] = [
    {
      termeOrigen: 'Interessat',
      termeRelacionat: 'b',
      tipusRelacio: 'Correspondència (Terme similar que pot tenir variacions en diferents departaments o sistemes)',
    },
  ];

  private readonly templateRelacions = this.relacions.map((row) => ({ ...row }));

  constructor(
    private readonly http: HttpClient,
    private readonly municipiService: MunicipiService,
  ) {}

  ngOnInit(): void {
    this.saveRequest$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.saveData());

    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        filter((municipi): municipi is string => Boolean(municipi)),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.isLoading = true;
          const localData = this.loadLocalData(municipi);
          if (localData) this.relacions = localData;
          if (!environment.production) {
            return of(localData ? { relacions: localData } : null);
          }
          const slug = toSlug(municipi);
          return this.http
            .get<{ relacions?: RelacioGlossariRow[] }>(
              `${API_BASE}/api/data/municipis/${slug}/relacion-glossari`,
            )
            .pipe(catchError(() => of(localData ? { relacions: localData } : null)));
        }),
      )
      .subscribe((data) => {
        this.relacions = (data?.relacions ?? this.templateRelacions).map((row) => ({ ...row }));
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayedRows(): Array<RelacioGlossariRow & { originalIndex: number }> {
    const filter = this.filterText.trim().toLocaleLowerCase('ca');
    let rows = this.relacions.map((row, originalIndex) => ({ ...row, originalIndex }));

    if (filter) {
      rows = rows.filter((row) =>
        this.columns.some(({ key }) => row[key].toLocaleLowerCase('ca').includes(filter)),
      );
    }

    if (this.sortColumn) {
      const column = this.sortColumn;
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((first, second) =>
        first[column].localeCompare(second[column], 'ca', { sensitivity: 'base' }) * direction,
      );
    }

    return rows;
  }

  addRow(): void {
    this.relacions = [
      ...this.relacions,
      { termeOrigen: '', termeRelacionat: '', tipusRelacio: '' },
    ];
    this.saveData();
  }

  removeRow(index: number): void {
    this.relacions.splice(index, 1);
    this.saveData();
  }

  sort(column: keyof RelacioGlossariRow): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  updateCell(index: number, column: keyof RelacioGlossariRow, event: Event): void {
    this.relacions[index][column] = (event.target as HTMLInputElement).value;
    this.persistLocally();
    this.saveRequest$.next();
  }

  saveData(): void {
    if (!this.municipiActual) return;

    this.persistLocally();
    if (!environment.production) return;

    const slug = toSlug(this.municipiActual);
    this.http
      .post(`${API_BASE}/api/data/municipis/${slug}/relacion-glossari`, {
        relacions: this.relacions,
      })
      .subscribe({
        error: (error) => console.error('Error saving relacion-glossari', error),
      });
  }

  private persistLocally(): void {
    if (!this.municipiActual) return;
    localStorage.setItem(this.storageKey(this.municipiActual), JSON.stringify(this.relacions));
  }

  private loadLocalData(municipi: string): RelacioGlossariRow[] | null {
    const stored = localStorage.getItem(this.storageKey(municipi));
    if (!stored) return null;
    try {
      return (JSON.parse(stored) as RelacioGlossariRow[]).map((row) => ({ ...row }));
    } catch {
      localStorage.removeItem(this.storageKey(municipi));
      return null;
    }
  }

  private storageKey(municipi: string): string {
    return `relacion-glossari:${toSlug(municipi)}`;
  }
}
