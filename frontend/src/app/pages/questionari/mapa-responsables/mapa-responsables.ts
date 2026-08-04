import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import * as d3 from 'd3';
// @ts-ignore
import { OrgChart } from 'd3-org-chart';

import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';


@Component({
  selector: 'app-mapa-responsables',
  templateUrl: './mapa-responsables.html',
  styleUrl: './mapa-responsables.css',
  standalone: true,
  imports: [FormsModule]
})
export class MapaResponsables implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  municipiActual = '';
  viewMode: 'tabla' | 'organigrama' = 'tabla';
  tableSubTab: 'rolsClau' | 'arees' | 'processos' | 'projectes' | 'altres' = 'rolsClau';
  isFullscreen = false;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  chart: any;

  selectedNodeId: string | null = null;
  highlightedNodeIds: string[] = [];

  isModalOpen = false;
  isEditing = false;
  currentEmployee: any = { id: '', parentId: '', name: '', position: '' };

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private municipiService: MunicipiService,
  ) {
    // Expose methods to global scope for D3 node HTML string binding
    (window as any).triggerOrgNodeEdit = (nodeId: string) => this.openEditModal(nodeId);
    (window as any).triggerOrgNodeAdd = (parentId: string) => this.openAddModalWithParent(parentId);
    (window as any).triggerOrgNodeDelete = (nodeId: string) => this.deleteEmployeeById(nodeId);
    (window as any).triggerOrgNodeSelect = (nodeId: string) => this.selectNode(nodeId);
    (window as any).triggerOrgNodeCollapse = (nodeId: string) => {
      if (this.chart) {
        this.chart.setExpanded(nodeId).render();
      }
    };
    (window as any).triggerOrgNodeInfo = (nodeId: string) => {
      this.openInfoModal(nodeId);
    };
  }

  isLoading = true;

  // --- Visibility toggles ---
  private static readonly SHOW_PROCESSOS_KEY = 'mapaResponsables.showProcessos';
  showProcessos = localStorage.getItem(MapaResponsables.SHOW_PROCESSOS_KEY) === 'true';

  toggleShowProcessos(): void {
    this.showProcessos = !this.showProcessos;
    localStorage.setItem(MapaResponsables.SHOW_PROCESSOS_KEY, String(this.showProcessos));
    if (!this.showProcessos && this.tableSubTab === 'processos') {
      this.tableSubTab = 'rolsClau';
    }
  }

  // --- Filters ---
  filterRols: string[] = [];
  filterArees: string[] = [];
  filterProcessos: string[] = [];
  filterProjectes: string[] = [];
  activeFilterDropdown: string | null = null;

  get hasActiveFilters(): boolean {
    return this.filterRols.length > 0 || this.filterArees.length > 0 ||
           this.filterProcessos.length > 0 || this.filterProjectes.length > 0;
  }

  get rolsOptions(): string[] {
    return [...new Set(this.rolsClau.map((r: any) => r.name).filter(Boolean))] as string[];
  }
  get areesOptions(): string[] {
    return [...new Set(this.arees.map((a: any) => a.name).filter(Boolean))] as string[];
  }
  get processosOptions(): string[] {
    return [...new Set(this.processos.map((p: any) => p.name).filter(Boolean))] as string[];
  }
  get projectesOptions(): string[] {
    return [...new Set(this.projectes.map((p: any) => p.name).filter(Boolean))] as string[];
  }

  toggleFilterDropdown(cat: string) {
    this.activeFilterDropdown = this.activeFilterDropdown === cat ? null : cat;
  }

  toggleFilter(cat: string, value: string) {
    let arr: string[];
    if (cat === 'rols') arr = this.filterRols;
    else if (cat === 'arees') arr = this.filterArees;
    else if (cat === 'processos') arr = this.filterProcessos;
    else if (cat === 'projectes') arr = this.filterProjectes;
    else return;
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(value);
    this.rerenderChart();
  }

  isFilterActive(cat: string, value: string): boolean {
    if (cat === 'rols') return this.filterRols.includes(value);
    if (cat === 'arees') return this.filterArees.includes(value);
    if (cat === 'processos') return this.filterProcessos.includes(value);
    if (cat === 'projectes') return this.filterProjectes.includes(value);
    return false;
  }

  clearFilters() {
    this.filterRols = [];
    this.filterArees = [];
    this.filterProcessos = [];
    this.filterProjectes = [];
    this.rerenderChart();
  }

  isNodeFilterHighlighted(nodeName: string): boolean {
    if (!this.hasActiveFilters) return false;
    if (this.filterRols.length > 0 &&
        this.rolsClau.some((r: any) => r.resp === nodeName && this.filterRols.includes(r.name))) return true;
    if (this.filterArees.length > 0 &&
        this.arees.some((a: any) => a.resp === nodeName && this.filterArees.includes(a.name))) return true;
    if (this.filterProcessos.length > 0 &&
        this.processos.some((p: any) => p.resp === nodeName && this.filterProcessos.includes(p.name))) return true;
    if (this.filterProjectes.length > 0 &&
        this.projectes.some((p: any) => p.resp === nodeName && this.filterProjectes.includes(p.name))) return true;
    return false;
  }

  rerenderChart() {
    if (this.chart) this.chart.data(this.orgData).render();
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          if (!municipi) {
            this.isLoading = false;
            return of(null);
          }
          this.isLoading = true;
          this.cdr.detectChanges();
          const slug = toSlug(municipi);
          return this.http.get<any>(`${API_BASE}/api/data/municipis/${slug}/mapa-responsables`).pipe(
            // A 404/network error just means no data yet — don't let it kill the subscription
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          this.rolsClau = data?.rolsClau ?? [];
          this.arees = data?.arees ?? [];
          this.processos = data?.processos ?? [];
          this.projectes = data?.projectes ?? [];
          this.altres = data?.altres ?? [];
          this.orgData = data?.orgData ?? [];
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
    const payload = {
      rolsClau: this.rolsClau,
      arees: this.arees,
      processos: this.processos,
      projectes: this.projectes,
      altres: this.altres,
      orgData: this.orgData
    };
    this.http.post(`${API_BASE}/api/data/municipis/${slug}/mapa-responsables`, payload).subscribe({
      error: (err) => console.error('Error saving data', err)
    });
  }

  // --- Table Row CRUD ---
  isRowModalOpen = false;
  currentTableKey: string = '';
  currentRowIndex: number = -1;
  currentRow: any = {};
  customRespMode = false;
  customProjecteMode = false;

  projectesSuggestions: string[] = [
    "Pla d’Actuació Municipal (PAM) 2023-2027",
    "Plan de Vivienda Pública",
    "Proyecto 'Vila Educadora'",
    "Plan de Transformación Digital del Ayuntamiento",
    "Programa de Salud Comunitaria con los CAP",
    "Plan de Prevención de Abusos Sexuales en Entidades",
    "Estrategia de Seguridad, Civismo y Convivencia",
    "Plan de Choque contra el Cambio Climático (Municipio Verde)",
    "Plan de Promoción de la Lengua Catalana",
    "Estrategia de Feminismos e Igualdad",
    "Programa de Control de Salubridad y Plagas",
    "Plan de Formación en Seguridad Alimentaria",
    "Ciclo de Charlas de Alimentación Saludable",
    "Plan de Apoyo a Deportistas Individuales",
    "Estrategia de Atracción de Inversiones",
    "Plan de Bienestar Animal"
  ];

  openRowModal(tableKey: string, index: number) {
    this.currentTableKey = tableKey;
    this.currentRowIndex = index;
    this.currentRow = { ...(this as any)[tableKey][index] };
    this.isRowModalOpen = true;
  }

  addRow(tableKey: string) {
    this.currentTableKey = tableKey;
    this.currentRowIndex = -1;
    this.currentRow = { name: '', resp: '', email: '', phone: '', obs: '', areas: [] };
    this.isRowModalOpen = true;
  }

  deleteRow(tableKey: string, index: number) {
    (this as any)[tableKey].splice(index, 1);
    this.saveData();
  }

  saveRow() {
    if (this.currentRowIndex === -1) {
      (this as any)[this.currentTableKey].push({ ...this.currentRow });
    } else {
      (this as any)[this.currentTableKey][this.currentRowIndex] = { ...this.currentRow };
    }
    this.isRowModalOpen = false;
    this.saveData();
  }

  closeRowModal() {
    this.isRowModalOpen = false;
    this.showProcessDropdown = false;
    this.processSearch = '';
    this.processSearch = '';
    this.customRespMode = false;
    this.customProjecteMode = false;
  }

  // --- Taula: cerca i ordenació ---
  tableSearch: Record<string, string> = { rolsClau: '', arees: '', processos: '', projectes: '', altres: '' };
  tableSort: Record<string, { key: string; dir: 'asc' | 'desc' } | null> =
    { rolsClau: null, arees: null, processos: null, projectes: null, altres: null };

  setSort(tableKey: string, key: string) {
    const current = this.tableSort[tableKey];
    if (current && current.key === key) {
      this.tableSort[tableKey] = { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
    } else {
      this.tableSort[tableKey] = { key, dir: 'asc' };
    }
  }

  getSortIcon(tableKey: string, key: string): string {
    const s = this.tableSort[tableKey];
    if (!s || s.key !== key) return '↕';
    return s.dir === 'asc' ? '↑' : '↓';
  }

  getRows(tableKey: string): any[] {
    const list = ((this as any)[tableKey] as any[]) || [];
    const search = (this.tableSearch[tableKey] || '').trim().toLowerCase();
    let rows = search
      ? list.filter((item: any) =>
          ['name', 'resp', 'email', 'phone', 'obs'].some((k) =>
            (item[k] ?? '').toString().toLowerCase().includes(search),
          ),
        )
      : [...list];
    const sort = this.tableSort[tableKey];
    if (sort && sort.key) {
      rows = [...rows].sort((a, b) => {
        const av = (a[sort.key] ?? '').toString().toLowerCase();
        const bv = (b[sort.key] ?? '').toString().toLowerCase();
        if (av < bv) return sort.dir === 'asc' ? -1 : 1;
        if (av > bv) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }

  idxOf(tableKey: string, item: any): number {
    return ((this as any)[tableKey] as any[]).indexOf(item);
  }

  // --- Canvi ràpid de Responsable des de la taula (nomes taules 2-5) ---
  activeRespDropdown: { table: string; index: number } | null = null;

  get distinctResponsables(): string[] {
    return [...new Set(this.rolsClau.map((r: any) => r.resp).filter((r: string) => r && r.trim() !== ''))] as string[];
  }

  toggleRespDropdown(tableKey: string, item: any, event: Event) {
    event.stopPropagation();
    const idx = this.idxOf(tableKey, item);
    if (this.activeRespDropdown && this.activeRespDropdown.table === tableKey && this.activeRespDropdown.index === idx) {
      this.activeRespDropdown = null;
    } else {
      this.activeRespDropdown = { table: tableKey, index: idx };
    }
  }

  isRespDropdownOpen(tableKey: string, item: any): boolean {
    if (!this.activeRespDropdown) return false;
    return this.activeRespDropdown.table === tableKey && this.activeRespDropdown.index === this.idxOf(tableKey, item);
  }

  closeRespDropdown() {
    this.activeRespDropdown = null;
  }

  selectRespForRow(tableKey: string, item: any, resp: string) {
    item.resp = resp;
    // El correu i el telèfon sempre es deriven del Rol Clau corresponent
    let email = '';
    let phone = '';
    for (const table of [this.rolsClau, this.arees, this.processos, this.projectes, this.altres]) {
      for (const entry of table) {
        if (entry.resp === resp) {
          if (!email && entry.email) email = entry.email;
          if (!phone && entry.phone) phone = entry.phone;
        }
      }
      if (email && phone) break;
    }
    item.email = email;
    item.phone = phone;
    this.activeRespDropdown = null;
    this.saveData();
  }

  // --- Rols Info Modal ---
  isRolsInfoModalOpen = false;

  // --- Info Modal ---
  isInfoModalOpen = false;
  infoNode: any = null;
  infoRoles: any[] = [];
  infoProcessos: any[] = [];
  infoProjectes: any[] = [];
  infoArees: any[] = [];

  openInfoModal(nodeId: string) {
    const node = this.orgData.find(n => n.id === nodeId);
    if (!node) return;
    this.infoNode = node;
    const name = node.name;
    this.infoRoles = this.rolsClau.filter((r: any) => r.resp === name);
    this.infoProcessos = this.processos.filter((r: any) => r.resp === name);
    this.infoProjectes = this.projectes.filter((r: any) => r.resp === name);
    this.infoArees = this.arees.filter((r: any) => r.resp === name);
    this.isInfoModalOpen = true;
    this.cdr.detectChanges();
  }

  closeInfoModal() {
    this.isInfoModalOpen = false;
  }

  removeInfoItem(type: 'rolsClau'|'processos'|'projectes'|'arees', item: any) {
    const globalList = (this as any)[type];
    const infoList = type === 'rolsClau' ? this.infoRoles : type === 'processos' ? this.infoProcessos : type === 'projectes' ? this.infoProjectes : this.infoArees;
    
    const idxG = globalList.indexOf(item);
    if (idxG > -1) globalList.splice(idxG, 1);
    
    const idxI = infoList.indexOf(item);
    if (idxI > -1) infoList.splice(idxI, 1);
    
    this.saveData();
    if (this.chart) this.chart.render(); // update icons
  }

  editInfoItem(type: 'rolsClau'|'processos'|'projectes'|'arees', item: any) {
    const globalList = (this as any)[type];
    const idx = globalList.indexOf(item);
    if (idx > -1) {
      if (type === 'processos') {
        this.openRowModalProcessos(type, idx);
      } else {
        this.openRowModal(type, idx);
      }
    }
  }

  addInfoItem(type: 'rolsClau'|'processos'|'projectes'|'arees') {
    if (type === 'processos') {
      this.addRowProcessos(type);
    } else {
      this.addRow(type);
    }
    this.currentRow.resp = this.infoNode.name; // pre-fill their name
  }

  populateTable(tableKey: string) {
    let suggestions: string[] = [];
    if (tableKey === 'rolsClau') {
      suggestions = [
        'Custodi tècnic de les dades',
        'Gestor de les dades',
        'Propietari de les dades',
        'Responsable de qualitat de les dades'
      ];
    } else if (tableKey === 'processos') {
      suggestions = this.allProcessosSuggestions;
    } else if (tableKey === 'projectes') {
      suggestions = this.projectesSuggestions;
    }

    if (suggestions.length === 0) return;

    const currentList = (this as any)[tableKey];
    const existingNames = currentList.map((item: any) => item.name);

    for (const suggestion of suggestions) {
      if (!existingNames.includes(suggestion)) {
        currentList.push({ name: suggestion, resp: '', email: '', phone: '', obs: '', areas: [] });
      }
    }
    this.saveData();
  }

  isDuplicate(tableKey: string, name: string): boolean {
    if (!name) return false;
    const list = (this as any)[tableKey] || [];
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].name === name) count++;
      if (count > 1) return true;
    }
    return false;
  }

  toggleArea(areaName: string, checked: boolean) {
    if (!this.currentRow.areas) this.currentRow.areas = [];
    if (checked) {
      if (!this.currentRow.areas.includes(areaName)) {
        this.currentRow.areas = [...this.currentRow.areas, areaName];
      }
    } else {
      this.currentRow.areas = this.currentRow.areas.filter((a: string) => a !== areaName);
    }
  }

  get rolsClauPersones() {
    return this.rolsClau.filter((r: any) => r.resp && r.resp.trim() !== '');
  }

  onProjecteSelect(name: string) {
    if (name === '__custom_projecte__') {
      this.customProjecteMode = true;
      this.currentRow.name = '';
    } else {
      this.customProjecteMode = false;
    }
  }

  onResponsableSelect(resp: string) {
    if (resp === '__custom__') {
      this.customRespMode = true;
      this.currentRow.resp = '';
      return;
    }
    this.customRespMode = false;
    // Search across all tables for the person's contact info
    let email = '';
    let phone = '';
    for (const table of [this.rolsClau, this.arees, this.processos, this.projectes, this.altres]) {
      for (const entry of table) {
        if (entry.resp === resp) {
          if (!email && entry.email) email = entry.email;
          if (!phone && entry.phone) phone = entry.phone;
          if (email && phone) break;
        }
      }
      if (email && phone) break;
    }
    this.currentRow.email = email;
    this.currentRow.phone = phone;
  }

  // --- Processos autocomplete ---
  showProcessDropdown = false;
  processSearch = '';

  // Comprehensive list of processes and procedures for a Barcelona province municipality (<20k inhabitants)
  allProcessosSuggestions: string[] = [
    // Urbanisme i habitatge
    'Llicència d\'obres majors',
    'Llicència d\'obres menors',
    'Llicència d\'activitat econòmica',
    'Comunicació prèvia d\'activitat',
    'Cèdula d\'habitabilitat',
    'Llicència de primera ocupació',
    'Parcel·lació i segregació de finques',
    'Modificació del planejament urbanístic',
    'Disciplina urbanística / Denúncia infracció urbanística',
    'Inspecció tècnica d\'edificis (ITE)',
    'Gestió d\'habitatge de protecció oficial',
    // Tributs i finances
    'Liquidació de l\'Impost de Béns Immobles (IBI)',
    'Liquidació de l\'Impost d\'Activitats Econòmiques (IAE)',
    'Liquidació de l\'Impost sobre Vehicles de Tracció Mecànica (IVTM)',
    'Liquidació de la plusvàlua (IIVTNU)',
    'Liquidació de l\'Impost sobre Construccions, Instal·lacions i Obres (ICIO)',
    'Liquidació de taxes de residus',
    'Liquidació de taxes d\'escoles bressol',
    'Liquidació de taxes d\'activitats esportives i culturals',
    'Fraccionament i ajornament de deutes tributaris',
    'Reclamació i recursos tributaris',
    // Padró municipal i registre civil
    'Alta al padró municipal d\'habitants',
    'Baixa al padró municipal d\'habitants',
    'Canvi de domicili al padró',
    'Renovació d\'inscripció padronal (estrangers)',
    'Certificat de convivència',
    'Certificat d\'empadronament',
    'Volant de residència',
    // Serveis socials
    'Atenció social bàsica',
    'Sol·licitud d\'ajudes d\'urgència social',
    'Gestió de la Renda Garantida de Ciutadania (RGC)',
    'Servei d\'Ajuda a Domicili (SAD)',
    'Teleassistència domiciliària',
    'Gestió de places en residències de gent gran',
    'Servei de menjador social',
    'Targeta acreditativa de discapacitat',
    'Gestió de centres de dia',
    'Atenció a la infància i adolescència (CSMIJ)',
    // Contractació i proveïdors
    'Contractes menors de béns i serveis',
    'Licitació per procediment obert simplificat',
    'Licitació per procediment obert ordinari',
    'Contracte de concessió de serveis',
    'Subministraments de material d\'oficina',
    'Contractació d\'obres d\'infraestructura',
    // Subvencions i ajudes
    'Convocatòria de subvencions a entitats',
    'Subvencions a activitats culturals i esportives',
    'Subvencions per a obres d\'accessibilitat',
    'Ajudes a l\'agricultura i ramaderia',
    'Ajudes a l\'habitatge (rehabilitació, lloguer)',
    // Recursos Humans
    'Altes i baixes de personal',
    'Pagament de nòmines',
    'Concursos i oposicions',
    'Avaluació de l\'acompliment del personal',
    'Gestió de permisos i llicències de personal',
    'Prevenció de riscos laborals',
    // Medi ambient i espai públic
    'Recollida de residus sòlids urbans',
    'Gestió del punt verd municipal',
    'Neteja viària i espai públic',
    'Manteniment de parcs i jardins',
    'Gestió d\'aigües residuals (EDAR)',
    'Llicències d\'abocaments',
    'Denúncia d\'abocament il·legal',
    'Control de plagues i desinfecció',
    'Inspeccions de salut pública',
    // Seguretat i emergències
    'Denúncies de la policia local',
    'Infraccions de trànsit',
    'Atenció a accidents i emergències',
    'Grua i dipòsit de vehicles',
    'Autoritzacions de tall de via pública',
    'Gestió de sistemes de videovigilància',
    // Educació i joventut
    'Inscripcions a l\'escola bressol municipal',
    'Inscripcions a activitats extraescolars',
    'Ajudes de menjador escolar',
    'Beques i ajudes a l\'estudi',
    'Programes de joventut i informació juvenil',
    'Carnets jove i documentació',
    // Cultura, esports i festes
    'Inscripcions a activitats esportives municipals',
    'Reserva d\'instal·lacions esportives',
    'Gestió de la biblioteca municipal',
    'Permisos i autoritzacions per a festes majors',
    'Permisos d\'espectacles i activitats lúdiques',
    'Gestió del casal municipal de cultura',
    // Comerç i mercats
    'Llicències de venda no sedentària (mercats i fires)',
    'Autoritzacions de terrasses i veladors',
    'Inspecció d\'establiments comercials',
    // Turisme
    'Informació turística i oficina de turisme',
    'Autorització d\'habitatges d\'ús turístic (HUT)',
    // Transparència i participació
    'Accés a la informació pública (transparència)',
    'Queixes i suggeriments ciutadans',
    'Peticions de participació ciutadana',
    'Publicació al Tauler d\'Edictes / BOP',
    // Registre i notificació
    'Registre d\'entrada i sortida de documents',
    'Notificació electrònica de resolucions',
    'Certificació de documents municipals',
  ];

  get processosFiltered(): string[] {
    if (!this.processSearch.trim()) return this.allProcessosSuggestions;
    const q = this.processSearch.toLowerCase();
    return this.allProcessosSuggestions.filter(p => p.toLowerCase().includes(q));
  }

  onProcessSearchInput(value: string) {
    this.processSearch = value;
    this.currentRow.name = value;
    this.showProcessDropdown = true;
  }

  selectProcesso(name: string) {
    this.currentRow.name = name;
    this.processSearch = name;
    this.showProcessDropdown = false;
  }

  openRowModalProcessos(tableKey: string, index: number) {
    this.openRowModal(tableKey, index);
    this.processSearch = this.currentRow.name || '';
    this.showProcessDropdown = false;
  }

  addRowProcessos(tableKey: string) {
    this.addRow(tableKey);
    this.processSearch = '';
    this.showProcessDropdown = false;
  }

  rolsClau: any[] = [];
  arees: any[] = [];
  processos: any[] = [];
  projectes: any[] = [];
  altres: any[] = [];
  orgData: any[] = [];

  setViewMode(mode: 'tabla' | 'organigrama') {
    this.viewMode = mode;
    if (mode === 'organigrama') {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  openAddModal() {
    this.isEditing = false;
    this.currentEmployee = { 
      id: Date.now().toString(), 
      parentId: this.orgData.length > 0 ? this.orgData[0].id : '', 
      name: '', 
      position: '' 
    };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  openAddModalWithParent(parentId: string) {
    this.isEditing = false;
    this.currentEmployee = { 
      id: Date.now().toString(), 
      parentId: parentId, 
      name: '', 
      position: '' 
    };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditModal(nodeId: string) {
    const emp = this.orgData.find(e => e.id === nodeId);
    if (emp) {
      this.isEditing = true;
      this.currentEmployee = { ...emp };
      this.isModalOpen = true;
      this.cdr.detectChanges();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveEmployee() {
    if (this.isEditing) {
      const idx = this.orgData.findIndex(e => e.id === this.currentEmployee.id);
      if (idx !== -1) {
        this.orgData[idx] = { ...this.currentEmployee };
      }
    } else {
      this.orgData.push({ ...this.currentEmployee });
    }
    
    this.closeModal();
    this.renderChart();
    this.saveData();
  }

  deleteEmployee() {
    this.deleteEmployeeById(this.currentEmployee.id);
  }

  deleteEmployeeById(nodeId: string) {
    const empToDelete = this.orgData.find(e => e.id === nodeId);
    if (empToDelete) {
      // Reassign children to the deleted node's parent
      this.orgData.forEach(e => {
        if (e.parentId === empToDelete.id) {
          e.parentId = empToDelete.parentId;
        }
      });
      this.orgData = this.orgData.filter(e => e.id !== nodeId);
    }
    
    this.closeModal();
    this.renderChart();
    this.saveData();
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      setTimeout(() => {
        if (this.chart) {
          this.chart.container(this.chartContainer.nativeElement).render();
          this.chart.fit();
        }
      }, 100);
    } else {
      setTimeout(() => {
        if (this.chart) {
          this.chart.container(this.chartContainer.nativeElement).render();
          this.chart.fit();
        }
      }, 100);
    }
  }

  getDescendants(nodeId: string): string[] {
    const descendants: string[] = [];
    const children = this.orgData.filter(e => e.parentId === nodeId);
    children.forEach(child => {
      descendants.push(child.id);
      descendants.push(...this.getDescendants(child.id));
    });
    return descendants;
  }

  selectNode(nodeId: string) {
    if (this.selectedNodeId === nodeId) {
      // Toggle off
      this.selectedNodeId = null;
      this.highlightedNodeIds = [];
    } else {
      this.selectedNodeId = nodeId;
      this.highlightedNodeIds = this.getDescendants(nodeId);
      this.highlightedNodeIds.push(nodeId);
      
      if (this.chart) {
        // Expand the selected node and all its descendants
        this.highlightedNodeIds.forEach(id => {
          this.chart.setExpanded(id);
        });
      }
    }
    
    if (this.chart) {
      this.chart.render();
    }
  }

  getDepth(nodeId: string): number {
    let depth = 0;
    let currentId = nodeId;
    while (currentId) {
      const node = this.orgData.find(n => n.id === currentId);
      if (node && node.parentId) {
        depth++;
        currentId = node.parentId;
      } else {
        break;
      }
    }
    return depth;
  }

  renderChart() {
    if (!this.chartContainer) return;

    if (!this.chart) {
      this.chart = new OrgChart()
        .container(this.chartContainer.nativeElement)
        .data(this.orgData)
        .nodeWidth((d: any) => 260)
        .nodeHeight((d: any) => 100)
        .childrenMargin((d: any) => 40)
        .compactMarginBetween((d: any) => 25)
        .compactMarginPair((d: any) => 60)
        .layout('top') // Top-down layout
        .linkUpdate(function (this: any, d: any, i: any, arr: any) {
          d3.select(this)
            .attr('stroke', '#94a3b8') // slate-400 slightly darker line
            .attr('stroke-width', 3);  // thicker link lines
        })
        .onNodeClick((d: any) => {
           // Relying on explicit clicks via triggerOrgNodeSelect in nodeContent
        })
        .nodeContent((d: any) => {
          const nodeId = d.data.id;
          const depth = this.getDepth(nodeId);
          const isSelected = this.selectedNodeId === nodeId;
          const isHighlighted = this.highlightedNodeIds.includes(nodeId) && !isSelected;
          
          let bgColor, borderColor, nameColor, posBgColor, posTextColor, hoverBorder;

          // Default styling based on depth level
          if (depth === 0) {
            // Level 0: Top Management (Amber/Gold) - More Intense
            bgColor = '#fef3c7'; borderColor = '#f59e0b'; nameColor = '#78350f'; 
            posBgColor = '#fde68a'; posTextColor = '#b45309'; hoverBorder = '#d97706';
          } else if (depth === 1) {
            // Level 1: Departments (Blue) - More Intense
            bgColor = '#dbeafe'; borderColor = '#3b82f6'; nameColor = '#1e3a8a'; 
            posBgColor = '#bfdbfe'; posTextColor = '#1d4ed8'; hoverBorder = '#2563eb';
          } else if (depth === 2) {
            // Level 2: Teams (Purple/Violet) - More Intense
            bgColor = '#ede9fe'; borderColor = '#8b5cf6'; nameColor = '#4c1d95'; 
            posBgColor = '#ddd6fe'; posTextColor = '#6d28d9'; hoverBorder = '#7c3aed';
          } else {
            // Level 3+: Employees (Slate/Gray) - More Intense
            bgColor = '#f1f5f9'; borderColor = '#94a3b8'; nameColor = '#0f172a'; 
            posBgColor = '#e2e8f0'; posTextColor = '#334155'; hoverBorder = '#64748b';
          }

          let blinkClass = '';

          // Override if selected or highlighted
          if (isSelected) {
            blinkClass = 'blink-selected';
            bgColor = '#22c55e'; // green-500 (intense)
            borderColor = '#16a34a'; // green-600
            nameColor = '#ffffff'; // white
            posBgColor = '#15803d'; // green-700
            posTextColor = '#ffffff'; // white
            hoverBorder = '#14532d'; // green-900
          } else if (isHighlighted) {
            bgColor = '#bbf7d0'; // green-200 (less intense)
            borderColor = '#4ade80'; // green-400
            nameColor = '#111827'; // gray-900
            posBgColor = '#86efac'; // green-300
            posTextColor = '#166534'; // green-800
            hoverBorder = '#16a34a'; // green-600
          } else if (this.isNodeFilterHighlighted(d.data.name)) {
            bgColor = '#ccfbf1'; borderColor = '#14b8a6'; nameColor = '#134e4a';
            posBgColor = '#99f6e4'; posTextColor = '#0f766e'; hoverBorder = '#0d9488';
          }
          
          const rolesCount = this.rolsClau.filter((r: any) => r.resp === d.data.name).length;
          const processosCount = this.processos.filter((r: any) => r.resp === d.data.name).length;
          const projectesCount = this.projectes.filter((r: any) => r.resp === d.data.name).length;

          const infoIconsHtml = `
            <div style="position: absolute; bottom: 8px; left: 0; width: 100%; display: flex; justify-content: center; gap: 16px; z-index: 10; box-sizing: border-box;">
              ${rolesCount > 0 ? `<div onclick="event.stopPropagation(); window.triggerOrgNodeInfo('${nodeId}')" title="Rols" style="background: #4f46e5; color: white; border: 1px solid #4338ca; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 14s-1 0-1-1 1-4 5-4v1c-1.8 0-3.3.9-4 2.3v.7H3zm3-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg> ${rolesCount}
              </div>` : ''}
              ${processosCount > 0 ? `<div onclick="event.stopPropagation(); window.triggerOrgNodeInfo('${nodeId}')" title="Processos" style="background: #4f46e5; color: white; border: 1px solid #4338ca; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2a3 3 0 0 1 2.99 2.5H16v1h-2.01A3 3 0 0 1 11 8c-1.46 0-2.68-.86-3.13-2H0V5h7.87A3 3 0 0 1 11 2zm0 1a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 7a3 3 0 0 1 2.99 2.5H16v1H7.99A3 3 0 0 1 5 14c-1.46 0-2.68-.86-3.13-2H0v-1h1.87A3 3 0 0 1 5 10zm0 1a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg> ${processosCount}
              </div>` : ''}
              ${projectesCount > 0 ? `<div onclick="event.stopPropagation(); window.triggerOrgNodeInfo('${nodeId}')" title="Projectes" style="background: #4f46e5; color: white; border: 1px solid #4338ca; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/></svg> ${projectesCount}
              </div>` : ''}
            </div>
          `;

          return `
            <div class="${blinkClass} org-node-container" ondblclick="window.triggerOrgNodeCollapse('${nodeId}'); event.stopPropagation();" onclick="window.triggerOrgNodeSelect('${nodeId}')" style="font-family: 'Inter', sans-serif; background-color: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 260px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box; position: relative; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='${hoverBorder}'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.2)';" onmouseout="this.style.borderColor='${borderColor}'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)';">
              <div class="org-node-name" style="font-size: 15px; font-weight: 600; color: ${nameColor}; text-align: center; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none; transition: font-size 0.2s ease;">${d.data.name}</div>
              <div class="org-node-pos" style="font-size: 12px; color: ${posTextColor}; font-weight: 500; text-align: center; background-color: ${posBgColor}; padding: 4px 10px; border-radius: 9999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none; transition: font-size 0.2s ease;">${d.data.position}</div>
              
              <!-- Hover actions overlay -->
              <!-- Delete: Top Left (only if not root) -->
              ${d.data.parentId !== '' ? `
              <div style="position: absolute; top: 6px; left: 6px; padding: 0; z-index: 20;">
                <button onclick="event.stopPropagation(); if(confirm('N\\'estàs segur d\\'eliminar aquest node i associar els fills al pare?')) window.triggerOrgNodeDelete('${nodeId}')" title="Eliminar" style="background: white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1px solid #fee2e2; cursor: pointer; color: #ef4444; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              ` : ''}
              
              <!-- Edit: Top Center -->
              <div style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); padding: 0; z-index: 20;">
                <button onclick="event.stopPropagation(); window.triggerOrgNodeEdit('${nodeId}')" title="Editar" style="background: white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1px solid #e5e7eb; cursor: pointer; color: #6b7280; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>

              <!-- Add: Top Right -->
              <div style="position: absolute; top: 6px; right: 6px; padding: 0; z-index: 20;">
                <button onclick="event.stopPropagation(); window.triggerOrgNodeAdd('${nodeId}')" title="Afegir subaltern" style="background: white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1px solid #d1fae5; cursor: pointer; color: #10b981; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.15) rotateY(360deg)';" onmouseout="this.style.transform='scale(1) rotateY(0deg)';">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              
              ${infoIconsHtml}
            </div>
          `;
        })
        .render();
    } else {
      this.chart.container(this.chartContainer.nativeElement).data(this.orgData).render();
    }
  }
}
