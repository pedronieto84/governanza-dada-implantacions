import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { toSlug } from '../../../utils/slug';
import { getHttpErrorCode } from '../../../utils/http-error';
import { fillEmptyFields, randomCode, randomFrom, randomInt, randomWords, randomYesNo } from '../../../utils/fake-data';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';

const EMPTY_ATRIBUT = () => ({
  id: '', nom: '', desc: '', entitat: '', clau: '', sistema: '', tipus: '',
  sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '',
  consistencia: '', actualizacio: ''
});

const DEFAULT_ATRIBUTS = [
  { id: 'A.1', nom: 'Nom',                  desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada mestre',        sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.2', nom: 'Cognom1',              desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de referència', sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.3', nom: 'Cognom2',              desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.4', nom: 'Tipus identificació',  desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.5', nom: 'Número identificació', desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.6', nom: 'Nacionalitat',         desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.7', nom: 'Lloc de naixement',    desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'A.8', nom: 'Data naixement',       desc: '', entitat: 'Habitants',   clau: '', sistema: 'Padró',             tipus: 'Dada de negoci',     sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.1', nom: 'Nom',                  desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: 'Metadada de negoci', sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.2', nom: 'Cognom1',              desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: '',                   sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.3', nom: 'Cognom2',              desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: '',                   sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.4', nom: 'Tipus identificació',  desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: '',                   sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.5', nom: 'Número identificació', desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: '',                   sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
  { id: 'B.6', nom: 'Nacionalitat',         desc: '', entitat: 'Interessats', clau: '', sistema: 'Gestor expedients', tipus: '',                   sensible: '', terme: '', format: '', nul: '', unicitat: '', completesa: '', consistencia: '', actualizacio: '' },
];

@Component({
  selector: 'app-atributs',
  imports: [CommonModule, FormsModule, FakeDataButton, StickyStackDirective],
  templateUrl: './atributs.html',
  styleUrl: './atributs.css',
  standalone: true,
})
export class Atributs implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private municipiActual = '';

  isLoading = true;
  isModalOpen = false;
  editIndex = -1;
  currentItem: any = EMPTY_ATRIBUT();
  atributs: any[] = [];

  tipusOptions = ['Dada mestre', 'Dada de referència', 'Dada de negoci', 'Metadada de negoci', 'Dada operativa', 'Dada analítica'];
  siNoOptions = ['', 'SI', 'NO'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private municipiService: MunicipiService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.atributs = [];
          if (!municipi) {
            this.isLoading = false;
            return of(null);
          }
          this.isLoading = true;
          const slug = toSlug(municipi);
          return this.http.get<any>(`${API_BASE}/api/data/municipis/${slug}/atributs`).pipe(
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          this.atributs = data?.atributs ?? [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveData() {
    if (!this.municipiActual) {
      console.warn('No hi ha cap municipi seleccionat, no es pot desar');
      return;
    }
    const slug = toSlug(this.municipiActual);
    this.http.post(`${API_BASE}/api/data/municipis/${slug}/atributs`, { atributs: this.atributs }).subscribe({
      next: () => this.toast.success(),
      error: (err) => {
        console.error('Error saving atributs', err);
        this.toast.error(`Error ${getHttpErrorCode(err)} al intentar guardar el dato`);
      }
    });
  }

  openModal(index: number) {
    this.editIndex = index;
    this.currentItem = index === -1 ? EMPTY_ATRIBUT() : { ...this.atributs[index] };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveItem() {
    if (this.editIndex === -1) {
      this.atributs.push({ ...this.currentItem });
    } else {
      this.atributs[this.editIndex] = { ...this.currentItem };
    }
    this.isModalOpen = false;
    this.saveData();
  }

  deleteItem(index: number) {
    this.atributs.splice(index, 1);
    this.saveData();
  }

  /** Omple l'inventari amb atributs versemblants (crea files si cal) i desa immediatament */
  fillFakeData(): void {
    if (this.atributs.length === 0) {
      this.atributs = Array.from({ length: 6 }, () => ({
        ...EMPTY_ATRIBUT(),
        id: randomCode('A', 1, 99),
        nom: randomWords(1, 2),
        entitat: randomWords(1, 1),
        sistema: randomWords(1, 1),
      }));
    }
    fillEmptyFields(this.atributs, {
      desc: () => randomWords(4, 10),
      clau: () => randomYesNo(),
      tipus: () => randomFrom(this.tipusOptions),
      sensible: () => randomYesNo(),
      terme: () => randomWords(1, 2),
      format: () => randomFrom(['VARCHAR(255)', 'INTEGER', 'DATE', 'BOOLEAN', 'TEXT']),
      nul: () => randomYesNo(),
      unicitat: () => randomFrom(['Única', 'No única']),
      completesa: () => `${randomInt(60, 100)}%`,
      consistencia: () => randomFrom(['Alta', 'Mitjana', 'Baixa']),
      actualizacio: () => randomFrom(['Diària', 'Setmanal', 'Mensual', 'Anual']),
    });
    this.saveData();
  }
}
