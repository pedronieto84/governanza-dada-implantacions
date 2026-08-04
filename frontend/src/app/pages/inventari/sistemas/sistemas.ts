import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';

import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';
import {
  SOFTWARE_CATALOG,
  NOM_CURT_OPTIONS,
  PROVEIDOR_OPTIONS,
  TIPUS_SOFTWARE_OPTIONS,
} from '../../../constants/software-catalog';

const EMPTY_SISTEMA = () => ({
  nomCurt: '', extern: 'No', descripcio: '', tipus: '', proveidor: '',
  adminSis: '', adminEmail: '', adminUnitat: '',
  arqDada: '', arqEmail: '', arqUnitat: ''
});

@Component({
  selector: 'app-sistemas',
  templateUrl: './sistemas.html',
  styleUrl: './sistemas.css',
  standalone: true,
  imports: [FormsModule]
})
export class Sistemas implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private municipiActual = '';
  isModalOpen = false;
  editIndex = -1;
  currentItem: any = EMPTY_SISTEMA();

  sistemas: any[] = [];

  // Llistes per als desplegables
  nomCurtOptions = NOM_CURT_OPTIONS;
  tipusOptions   = TIPUS_SOFTWARE_OPTIONS;
  proveidorOptions = PROVEIDOR_OPTIONS;

  // Control per a l'opció "Otros" (text lliure)
  nomCurtCustom    = false;
  tipusCustom      = false;
  proveidorCustom  = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private municipiService: MunicipiService,
  ) {}

  ngOnInit() {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        filter((municipi): municipi is string => !!municipi),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.sistemas = [];
          const slug = toSlug(municipi);
          return this.http.get<any>(`${API_BASE}/api/data/municipis/${slug}/sistemas`).pipe(
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          this.sistemas = data?.sistemas ?? [];
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
    this.http.post(`${API_BASE}/api/data/municipis/${slug}/sistemas`, { sistemas: this.sistemas }).subscribe({
      error: (err) => console.error('Error saving Sistemas data', err)
    });
  }

  openModal(index: number) {
    this.editIndex = index;
    this.currentItem = index === -1 ? EMPTY_SISTEMA() : { ...this.sistemas[index] };
    this.isModalOpen = true;

    // Detecta si el valor actual és un valor personalitzat o un de la llista
    this.nomCurtCustom   = !!this.currentItem.nomCurt   && !this.nomCurtOptions.includes(this.currentItem.nomCurt);
    this.tipusCustom     = !!this.currentItem.tipus     && !this.tipusOptions.includes(this.currentItem.tipus);
    this.proveidorCustom = !!this.currentItem.proveidor && !this.proveidorOptions.includes(this.currentItem.proveidor);
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveItem() {
    if (this.editIndex === -1) {
      this.sistemas.push({ ...this.currentItem });
    } else {
      this.sistemas[this.editIndex] = { ...this.currentItem };
    }
    this.isModalOpen = false;
    this.saveData();
  }

  deleteItem(index: number) {
    this.sistemas.splice(index, 1);
    this.saveData();
  }

  /**
   * Quan es selecciona un Nom Curt predefinit, omple automàticament el Proveïdor corresponent.
   * Si s'escull "Otros", buida el camp per permetre text lliure.
   */
  onNomCurtChange(value: string) {
    if (value === '__otros__') {
      this.nomCurtCustom = true;
      this.currentItem.nomCurt = '';
    } else {
      this.nomCurtCustom = false;
      this.currentItem.nomCurt = value;
      const match = SOFTWARE_CATALOG.find(s => s.nomCurt === value);
      if (match) {
        this.currentItem.proveidor = match.proveidor;
        this.proveidorCustom = false;
      }
    }
  }

  onTipusChange(value: string) {
    if (value === '__otros__') {
      this.tipusCustom = true;
      this.currentItem.tipus = '';
    } else {
      this.tipusCustom = false;
      this.currentItem.tipus = value;
    }
  }

  onProveidorChange(value: string) {
    if (value === '__otros__') {
      this.proveidorCustom = true;
      this.currentItem.proveidor = '';
    } else {
      this.proveidorCustom = false;
      this.currentItem.proveidor = value;
    }
  }
}
