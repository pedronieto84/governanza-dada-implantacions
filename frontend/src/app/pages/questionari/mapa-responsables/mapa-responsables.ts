import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs/operators';
// @ts-ignore
import { OrgChart } from 'd3-org-chart';

import { API_BASE } from '../../../api.config';


@Component({
  selector: 'app-mapa-responsables',
  templateUrl: './mapa-responsables.html',
  styleUrl: './mapa-responsables.css',
  standalone: true,
  imports: [FormsModule]
})
export class MapaResponsables implements OnInit {
  viewMode: 'tabla' | 'organigrama' = 'tabla';
  isFullscreen = false;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  chart: any;

  selectedNodeId: string | null = null;
  highlightedNodeIds: string[] = [];

  isModalOpen = false;
  isEditing = false;
  currentEmployee: any = { id: '', parentId: '', name: '', position: '' };

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {
    // Expose methods to global scope for D3 node HTML string binding
    (window as any).triggerOrgNodeEdit = (nodeId: string) => this.openEditModal(nodeId);
    (window as any).triggerOrgNodeAdd = (parentId: string) => this.openAddModalWithParent(parentId);
    (window as any).triggerOrgNodeDelete = (nodeId: string) => this.deleteEmployeeById(nodeId);
    (window as any).triggerOrgNodeSelect = (nodeId: string) => this.selectNode(nodeId);
  }

  ngOnInit() {
    this.http.get<any>(`${API_BASE}/api/data/mapa-responsables`).pipe(retry({ count: 5, delay: 2000 })).subscribe({
      next: (data) => {
        if (data.rolsClau) this.rolsClau = data.rolsClau;
        if (data.arees) this.arees = data.arees;
        if (data.processos) this.processos = data.processos;
        if (data.projectes) this.projectes = data.projectes;
        if (data.altres) this.altres = data.altres;
        if (data.orgData) this.orgData = data.orgData;
      },
      error: () => console.warn('No saved data found, using defaults.')
    });
  }

  saveData() {
    const payload = {
      rolsClau: this.rolsClau,
      arees: this.arees,
      processos: this.processos,
      projectes: this.projectes,
      altres: this.altres,
      orgData: this.orgData
    };
    this.http.post(`${API_BASE}/api/data/mapa-responsables`, payload).subscribe({
      error: (err) => console.error('Error saving data', err)
    });
  }

  // --- Table Row CRUD ---
  isRowModalOpen = false;
  currentTableKey: string = '';
  currentRowIndex: number = -1;
  currentRow: any = {};
  customRespMode = false;

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
    this.customRespMode = false;
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

  onResponsableSelect(resp: string) {
    if (resp === '__custom__') {
      this.customRespMode = true;
      this.currentRow.resp = '';
      return;
    }
    this.customRespMode = false;
    const person = this.rolsClau.find((r: any) => r.resp === resp);
    if (person) {
      this.currentRow.email = person.email;
      this.currentRow.phone = person.phone;
    }
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

  renderChart() {
    if (!this.chartContainer) return;

    if (!this.chart) {
      this.chart = new OrgChart()
        .container(this.chartContainer.nativeElement)
        .data(this.orgData)
        .nodeWidth((d: any) => 260)
        .nodeHeight((d: any) => 100)
        .childrenMargin((d: any) => 40)
        .compactMarginBetween((d: any) => 15)
        .compactMarginPair((d: any) => 80)
        .onNodeClick((d: any) => {
           // Relying on explicit clicks via triggerOrgNodeSelect in nodeContent
        })
        .nodeContent((d: any) => {
          const nodeId = d.data.id;
          const isHighlighted = this.highlightedNodeIds.includes(nodeId);
          const bgColor = isHighlighted ? '#e0f2fe' : '#f5f3ff'; // light blue or violet-50
          const borderColor = isHighlighted ? '#38bdf8' : '#c4b5fd'; // light blue 400 or violet-300
          
          return `
            <div onclick="window.triggerOrgNodeSelect('${nodeId}')" style="font-family: 'Inter', sans-serif; background-color: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 260px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box; position: relative; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#4338ca'; this.style.boxShadow='0 10px 15px -3px rgba(67, 56, 202, 0.2)';" onmouseout="this.style.borderColor='${borderColor}'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)';">
              <div style="font-size: 15px; font-weight: 600; color: #111827; text-align: center; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none;">${d.data.name}</div>
              <div style="font-size: 12px; color: #4338ca; font-weight: 500; text-align: center; background-color: #e0e7ff; padding: 4px 10px; border-radius: 9999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none;">${d.data.position}</div>
              
              <!-- Hover actions overlay -->
              <div style="position: absolute; top: 0; right: 0; padding: 4px; display: flex; gap: 4px;">
                <button onclick="event.stopPropagation(); window.triggerOrgNodeEdit('${nodeId}')" title="Editar" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onclick="event.stopPropagation(); window.triggerOrgNodeAdd('${nodeId}')" title="Afegir subaltern" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
                ${d.data.parentId !== '' ? `
                <button onclick="event.stopPropagation(); if(confirm('N\\'estàs segur d\\'eliminar aquest node i associar els fills al pare?')) window.triggerOrgNodeDelete('${nodeId}')" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                ` : ''}
              </div>
            </div>
          `;
        })
        .render();
    } else {
      this.chart.data(this.orgData).render();
    }
  }
}
