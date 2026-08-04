import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';

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
  imports: [CommonModule, FormsModule],
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
      error: (err) => console.error('Error saving atributs', err)
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
}
