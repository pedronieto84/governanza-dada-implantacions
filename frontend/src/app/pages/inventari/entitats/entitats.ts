import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { toSlug } from '../../../utils/slug';
import { getHttpErrorCode } from '../../../utils/http-error';
import { fillEmptyFields, randomFrom, randomInt, randomWords, randomYesNo } from '../../../utils/fake-data';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';

const EMPTY_ENTITAT = () => ({
  nom: '', descripcio: '', sistema: '', termesGlossari: '', tipus: '',
  infoGeografica: '', infoCiutadania: '', infoEmpreses: '', infoGenere: '',
  valoracioLlindar: '', valoracioEsbiaixos: '', valoracioQualitat: '',
  proteccioDades: '', visibilitat: '',
  intraoperabilitat: '', interoperabilitat: '', interesCiutadania: '',
  obertura: '', restriccionsObertura: '',
  entUnicaVegada: '', llengControlats: '',
  completesHistoric: '', completesActuals: '',
  enviamentsPeriodics: '', criticitat: '', quadresComandament: '',
  referentTecnic: '', emailReferent: '', unitatReferent: '',
  arquitecteDada: '', emailArquitecte: '', unitatArquitecte: '',
  observacions: ''
});

const MOCK_ENTITATS = [
  {
    nom: 'Padró municipal habitants',
    descripcio: 'Registre oficial de residents al municipi',
    sistema: 'SIGE', termesGlossari: 'Padró', tipus: 'Dada mestre',
    infoGeografica: 'SI', infoCiutadania: 'SI', infoEmpreses: 'NO', infoGenere: 'SI',
    valoracioLlindar: 'Alt risc de re-identificació',
    valoracioEsbiaixos: 'Possible esbiaixos de gènere detectats',
    valoracioQualitat: '85%', proteccioDades: 'Personals',
    visibilitat: "Intern per l'ens local",
    intraoperabilitat: 'SI', interoperabilitat: 'NO', interesCiutadania: 'SI',
    obertura: "No obert, es podria obrir/s'obrirà parcialment",
    restriccionsObertura: 'Dades personals sensibles',
    entUnicaVegada: 'NO', llengControlats: 'SI',
    completesHistoric: '95%', completesActuals: '98%',
    enviamentsPeriodics: 'SI', criticitat: 'SI', quadresComandament: 'SI',
    referentTecnic: 'Joan Puig', emailReferent: 'j.puig@municipi.cat',
    unitatReferent: 'Gestió Tributària',
    arquitecteDada: 'Anna Soler', emailArquitecte: 'a.soler@municipi.cat',
    unitatArquitecte: 'TIC', observacions: 'Actualització anual al gener'
  },
  {
    nom: "Llicències d'obres",
    descripcio: "Expedients de llicències d'edificació i obres",
    sistema: 'GESTIONA', termesGlossari: 'Llicència', tipus: 'Dada de negoci',
    infoGeografica: 'SI', infoCiutadania: 'NO', infoEmpreses: 'SI', infoGenere: 'NO',
    valoracioLlindar: 'Baix risc',
    valoracioEsbiaixos: 'Sense esbiaixos detectats',
    valoracioQualitat: '72%', proteccioDades: 'No personals', visibilitat: 'Públic',
    intraoperabilitat: 'SI', interoperabilitat: 'SI', interesCiutadania: 'NO',
    obertura: 'Obert', restriccionsObertura: '',
    entUnicaVegada: 'NO', llengControlats: 'NO',
    completesHistoric: '88%', completesActuals: '91%',
    enviamentsPeriodics: 'NO', criticitat: 'NO', quadresComandament: 'NO',
    referentTecnic: 'Marta Vidal', emailReferent: 'm.vidal@municipi.cat',
    unitatReferent: 'Urbanisme',
    arquitecteDada: 'Pere Mas', emailArquitecte: 'p.mas@municipi.cat',
    unitatArquitecte: 'TIC', observacions: ''
  },
  {
    nom: 'Cadastre municipal',
    descripcio: "Informació cadastral de parcel·les i béns immobles",
    sistema: 'SIG-MUNI', termesGlossari: 'Cadastre', tipus: 'Dada de referència',
    infoGeografica: 'SI', infoCiutadania: 'NO', infoEmpreses: 'NO', infoGenere: 'NO',
    valoracioLlindar: 'Mig risc', valoracioEsbiaixos: 'No aplica',
    valoracioQualitat: '90%', proteccioDades: 'Públic', visibilitat: 'Públic',
    intraoperabilitat: 'SI', interoperabilitat: 'SI', interesCiutadania: 'SI',
    obertura: 'Obert', restriccionsObertura: '',
    entUnicaVegada: 'SI', llengControlats: 'SI',
    completesHistoric: '99%', completesActuals: '99%',
    enviamentsPeriodics: 'SI', criticitat: 'NO', quadresComandament: 'SI',
    referentTecnic: 'Carles Roca', emailReferent: 'c.roca@municipi.cat',
    unitatReferent: 'Planejament',
    arquitecteDada: 'Anna Soler', emailArquitecte: 'a.soler@municipi.cat',
    unitatArquitecte: 'TIC', observacions: 'Sincronitzat amb la DGC'
  },
  {
    nom: 'Rebuts IBI',
    descripcio: "Liquidacions de l'impost sobre béns immobles",
    sistema: 'SAP', termesGlossari: 'IBI', tipus: 'Dada operativa',
    infoGeografica: 'NO', infoCiutadania: 'SI', infoEmpreses: 'SI', infoGenere: 'NO',
    valoracioLlindar: 'Alt risc de re-identificació',
    valoracioEsbiaixos: 'Sense esbiaixos detectats',
    valoracioQualitat: '97%', proteccioDades: 'Personals',
    visibilitat: "Intern per l'ens local",
    intraoperabilitat: 'SI', interoperabilitat: 'NO', interesCiutadania: 'SI',
    obertura: 'Restringit', restriccionsObertura: 'Dades fiscals confidencials',
    entUnicaVegada: 'NO', llengControlats: 'SI',
    completesHistoric: '100%', completesActuals: '100%',
    enviamentsPeriodics: 'SI', criticitat: 'SI', quadresComandament: 'SI',
    referentTecnic: 'Núria Ferrer', emailReferent: 'n.ferrer@municipi.cat',
    unitatReferent: 'Recaptació',
    arquitecteDada: 'Pere Mas', emailArquitecte: 'p.mas@municipi.cat',
    unitatArquitecte: 'TIC', observacions: 'Facturació anual obligatòria'
  },
  {
    nom: 'Catàleg de serveis socials',
    descripcio: 'Registre de prestacions i ajuts de serveis socials',
    sistema: 'SIRIUS', termesGlossari: 'Serveis Socials', tipus: 'Dada analítica',
    infoGeografica: 'NO', infoCiutadania: 'SI', infoEmpreses: 'NO', infoGenere: 'SI',
    valoracioLlindar: 'Alt risc de re-identificació',
    valoracioEsbiaixos: 'Esbiaixos de gènere i edat detectats',
    valoracioQualitat: '78%', proteccioDades: 'Confidencial',
    visibilitat: "Intern per àrea",
    intraoperabilitat: 'SI', interoperabilitat: 'NO', interesCiutadania: 'SI',
    obertura: "No obert, es podria obrir/s'obrirà",
    restriccionsObertura: "Dades sensibles de col·lectius vulnerables",
    entUnicaVegada: 'NO', llengControlats: 'SI',
    completesHistoric: '70%', completesActuals: '82%',
    enviamentsPeriodics: 'SI', criticitat: 'SI', quadresComandament: 'NO',
    referentTecnic: 'Laura Giménez', emailReferent: 'l.gimenez@municipi.cat',
    unitatReferent: 'Serveis Socials',
    arquitecteDada: 'Anna Soler', emailArquitecte: 'a.soler@municipi.cat',
    unitatArquitecte: 'TIC', observacions: "Accés restringit a treballadors socials"
  }
];

@Component({
  selector: 'app-entitats',
  imports: [FormsModule, FakeDataButton, StickyStackDirective],
  templateUrl: './entitats.html',
  styleUrl: './entitats.css',
  standalone: true,
})
export class Entitats implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private municipiActual = '';

  isLoading = true;
  isModalOpen = false;
  editIndex = -1;
  currentItem: any = EMPTY_ENTITAT();
  entitats: any[] = [];

  filterText = '';
  sortColumn = '';
  sortDir: 'asc' | 'desc' = 'asc';

  tipusOptions = ['Dada mestre', 'Dada de negoci', 'Dada de referència', 'Dada operativa', 'Dada analítica'];
  proteccioOptions = ['Personals', 'No personals', 'Confidencial', 'Públic'];
  visibilitatOptions = ['Intern per l\'ens local', 'Intern per àrea', 'Públic', 'Restringit'];
  oberturaOptions = [
    'Obert',
    'No obert, es podria obrir/s\'obrirà',
    'No obert, es podria obrir/s\'obrirà parcialment',
    'Restringit',
    'No aplicable'
  ];
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
          this.entitats = [];
          if (!municipi) {
            this.isLoading = false;
            return of(null);
          }
          this.isLoading = true;
          const slug = toSlug(municipi);
          return this.http.get<any>(`${API_BASE}/api/data/municipis/${slug}/entitats`).pipe(
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          this.entitats = data?.entitats?.length ? data.entitats : [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayEntitats() {
    let items = this.entitats.map((item, idx) => ({ ...item, _idx: idx }));
    if (this.filterText) {
      const ft = this.filterText.toLowerCase();
      items = items.filter(item =>
        Object.entries(item).some(([k, v]) => k !== '_idx' && String(v).toLowerCase().includes(ft))
      );
    }
    if (this.sortColumn) {
      items.sort((a, b) => {
        const va = String(a[this.sortColumn] ?? '').toLowerCase();
        const vb = String(b[this.sortColumn] ?? '').toLowerCase();
        return this.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return items;
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDir = 'asc';
    }
  }

  saveData() {
    if (!this.municipiActual) {
      console.warn('No hi ha cap municipi seleccionat, no es pot desar');
      return;
    }
    const slug = toSlug(this.municipiActual);
    this.http.post(`${API_BASE}/api/data/municipis/${slug}/entitats`, { entitats: this.entitats }).subscribe({
      next: () => this.toast.success(),
      error: (err) => {
        console.error('Error saving entitats', err);
        this.toast.error(`Error ${getHttpErrorCode(err)} al intentar guardar el dato`);
      }
    });
  }

  openModal(index: number) {
    this.editIndex = index;
    this.currentItem = index === -1 ? EMPTY_ENTITAT() : { ...this.entitats[index] };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveItem() {
    if (this.editIndex === -1) {
      this.entitats.push({ ...this.currentItem });
    } else {
      this.entitats[this.editIndex] = { ...this.currentItem };
    }
    this.isModalOpen = false;
    this.saveData();
  }

  deleteItem(index: number) {
    this.entitats.splice(index, 1);
    this.saveData();
  }

  /** Omple l'inventari amb entitats versemblants (crea files si cal) i desa immediatament */
  fillFakeData(): void {
    if (this.entitats.length === 0) {
      this.entitats = Array.from({ length: 4 }, () => ({
        ...EMPTY_ENTITAT(),
        nom: randomWords(1, 2),
      }));
    }
    fillEmptyFields(this.entitats, {
      descripcio: () => randomWords(4, 10),
      sistema: () => randomWords(1, 1),
      termesGlossari: () => randomWords(1, 2),
      tipus: () => randomFrom(this.tipusOptions),
      infoGeografica: () => randomYesNo(),
      infoCiutadania: () => randomYesNo(),
      infoEmpreses: () => randomYesNo(),
      infoGenere: () => randomYesNo(),
      valoracioLlindar: () => randomWords(3, 8),
      valoracioEsbiaixos: () => randomWords(3, 8),
      valoracioQualitat: () => `${randomInt(60, 100)}%`,
      proteccioDades: () => randomFrom(this.proteccioOptions),
      visibilitat: () => randomFrom(this.visibilitatOptions),
      intraoperabilitat: () => randomYesNo(),
      interoperabilitat: () => randomYesNo(),
      interesCiutadania: () => randomYesNo(),
      obertura: () => randomFrom(this.oberturaOptions),
      restriccionsObertura: () => randomWords(2, 6),
      entUnicaVegada: () => randomYesNo(),
      llengControlats: () => randomYesNo(),
      completesHistoric: () => `${randomInt(60, 100)}%`,
      completesActuals: () => `${randomInt(60, 100)}%`,
      enviamentsPeriodics: () => randomYesNo(),
      criticitat: () => randomYesNo(),
      quadresComandament: () => randomYesNo(),
      referentTecnic: () => randomWords(1, 2),
      emailReferent: () => `${randomWords(1, 1).toLowerCase()}@municipi.cat`,
      unitatReferent: () => randomWords(1, 2),
      arquitecteDada: () => randomWords(1, 2),
      emailArquitecte: () => `${randomWords(1, 1).toLowerCase()}@municipi.cat`,
      unitatArquitecte: () => randomWords(1, 2),
      observacions: () => randomWords(3, 8),
    });
    this.saveData();
  }
}
