import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { toSlug } from '../../../utils/slug';
import { getHttpErrorCode } from '../../../utils/http-error';
import { fillEmptyFields, randomEmail, randomFrom, randomName, randomUnitat, randomWords } from '../../../utils/fake-data';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';

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

type GlossariColumn = {
  key: keyof GlossariRow;
  label: string;
};

type GlossariTab = 'mestres' | 'referencia' | 'negoci';

@Component({
  selector: 'app-glossari-table',
  imports: [FormsModule, FakeDataButton, StickyStackDirective],
  templateUrl: './glossari-table.html',
  styleUrl: './glossari-table.css',
})
export class GlossariTable implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly saveRequest$ = new Subject<void>();
  private municipiActual = '';

  isLoading = false;
  activeTab: GlossariTab = 'mestres';
  filterText = '';
  sortColumn: keyof GlossariRow | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  readonly columns: GlossariColumn[] = [
    { key: 'terme', label: 'Terme de glossari' },
    { key: 'descripcio', label: 'Descripció' },
    { key: 'dominiFuncional', label: 'Domini funcional principal' },
    { key: 'tipus', label: 'Tipus' },
    { key: 'descFormat', label: 'Descripció de format' },
    { key: 'formula', label: 'Fórmula de càlcul (mètrica)' },
    { key: 'comentaris', label: 'Comentaris' },
    { key: 'alies', label: "Noms d'àlies" },
    { key: 'refGovern', label: 'Referent de Govern' },
    { key: 'emailRefGov', label: 'Correu electrònic del Referent de Govern' },
    { key: 'unitatRefGov', label: 'Unitat Orgànica Referent de Govern' },
    { key: 'respFuncional', label: 'Responsable Funcional' },
    { key: 'emailRespFunc', label: 'Correu electrònic del Responsable Funcional' },
    { key: 'unitatRespFunc', label: 'Unitat orgànica Responsable Funcional' },
  ];

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

  private readonly templateData = {
    dadesMestres: this.dadesMestres.map((row) => ({ ...row })),
    dadesReferencia: this.dadesReferencia.map((row) => ({ ...row })),
    dadesNegoci: this.dadesNegoci.map((row) => ({ ...row })),
  };

  constructor(
    private readonly http: HttpClient,
    private readonly municipiService: MunicipiService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
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
          if (localData) this.applyData(localData);
          const slug = toSlug(municipi);
          return this.http
            .get<Partial<typeof this.templateData>>(`${API_BASE}/api/data/municipis/${slug}/glossari`)
            .pipe(catchError(() => of(localData)));
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.applyData(data);
        } else {
          this.restoreTemplateData();
        }
        this.isLoading = false;
        // L'app és zoneless: cal forçar la detecció de canvis, arriben fora d'un event del DOM
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: GlossariTab): void {
    this.activeTab = tab;
    this.filterText = '';
    this.sortColumn = null;
  }

  addRow(): void {
    if (this.activeTab === 'mestres') {
      this.dadesMestres = [...this.dadesMestres, { ...this.emptyRow }];
    } else if (this.activeTab === 'referencia') {
      this.dadesReferencia = [...this.dadesReferencia, { ...this.emptyRow }];
    } else {
      this.dadesNegoci = [...this.dadesNegoci, { ...this.emptyRow }];
    }
    this.saveData();
  }

  removeRow(index: number): void {
    this.currentData.splice(index, 1);
    this.saveData();
  }

  /** Omple la pestanya activa amb dades de glossari versemblants (crea una fila si cal) i desa immediatament */
  fillFakeData(): void {
    if (this.currentData.length === 0) {
      this.currentData.push({ ...this.emptyRow });
    }
    fillEmptyFields(this.currentData, {
      terme: () => randomWords(1, 2),
      descripcio: () => randomWords(4, 10),
      dominiFuncional: () => randomWords(1, 2),
      tipus: () => randomFrom(['Text', 'Numèric', 'Data', 'Booleà']),
      descFormat: () => randomFrom(['VARCHAR(255)', 'INTEGER', 'DATE', 'BOOLEAN']),
      formula: () => randomWords(2, 5),
      comentaris: () => randomWords(3, 8),
      alies: () => randomWords(1, 3),
      refGovern: () => randomName(),
      emailRefGov: () => randomEmail(),
      unitatRefGov: () => randomUnitat(),
      respFuncional: () => randomName(),
      emailRespFunc: () => randomEmail(),
      unitatRespFunc: () => randomUnitat(),
    });
    this.saveData();
  }

  get currentData(): GlossariRow[] {
    switch (this.activeTab) {
      case 'mestres': return this.dadesMestres;
      case 'referencia': return this.dadesReferencia;
      case 'negoci': return this.dadesNegoci;
    }
  }

  get displayedRows(): Array<GlossariRow & { originalIndex: number }> {
    const filter = this.filterText.trim().toLocaleLowerCase('ca');
    let rows = this.currentData.map((row, originalIndex) => ({ ...row, originalIndex }));

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

  sort(column: keyof GlossariRow): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  updateCell(index: number, column: keyof GlossariRow, event: Event): void {
    this.currentData[index][column] = (event.target as HTMLInputElement).value;
    this.persistLocally();
    this.saveRequest$.next();
  }

  saveData(): void {
    if (!this.municipiActual) return;

    this.persistLocally();

    const slug = toSlug(this.municipiActual);
    const payload = {
      dadesMestres: this.dadesMestres,
      dadesReferencia: this.dadesReferencia,
      dadesNegoci: this.dadesNegoci,
    };
    this.http.post(`${API_BASE}/api/data/municipis/${slug}/glossari`, payload).subscribe({
      next: () => this.toast.success(),
      error: (error) => {
        console.error('Error saving glossari', error);
        this.toast.error(`Error ${getHttpErrorCode(error)} al intentar guardar el dato`);
      },
    });
  }

  private restoreTemplateData(): void {
    this.dadesMestres = this.cloneRows(this.templateData.dadesMestres);
    this.dadesReferencia = this.cloneRows(this.templateData.dadesReferencia);
    this.dadesNegoci = this.cloneRows(this.templateData.dadesNegoci);
  }

  private cloneRows(rows: GlossariRow[]): GlossariRow[] {
    return rows.map((row) => ({ ...row }));
  }

  private applyData(data: Partial<typeof this.templateData>): void {
    this.dadesMestres = this.cloneRows(data.dadesMestres ?? []);
    this.dadesReferencia = this.cloneRows(data.dadesReferencia ?? []);
    this.dadesNegoci = this.cloneRows(data.dadesNegoci ?? []);
  }

  private persistLocally(): void {
    if (!this.municipiActual) return;
    localStorage.setItem(this.storageKey(this.municipiActual), JSON.stringify({
      dadesMestres: this.dadesMestres,
      dadesReferencia: this.dadesReferencia,
      dadesNegoci: this.dadesNegoci,
    }));
  }

  private loadLocalData(municipi: string): Partial<typeof this.templateData> | null {
    const stored = localStorage.getItem(this.storageKey(municipi));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Partial<typeof this.templateData>;
    } catch {
      localStorage.removeItem(this.storageKey(municipi));
      return null;
    }
  }

  private storageKey(municipi: string): string {
    return `glossari:${toSlug(municipi)}`;
  }
}
