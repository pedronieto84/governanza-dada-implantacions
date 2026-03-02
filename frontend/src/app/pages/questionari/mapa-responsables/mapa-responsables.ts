import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
// @ts-ignore
import { OrgChart } from 'd3-org-chart';

const API_BASE = 'http://localhost:3005';

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
    this.http.get<any>(`${API_BASE}/api/data/mapa-responsables`).subscribe({
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

  openRowModal(tableKey: string, index: number) {
    this.currentTableKey = tableKey;
    this.currentRowIndex = index;
    this.currentRow = { ...(this as any)[tableKey][index] };
    this.isRowModalOpen = true;
  }

  addRow(tableKey: string) {
    this.currentTableKey = tableKey;
    this.currentRowIndex = -1;
    this.currentRow = { name: '', resp: '', email: '', phone: '', obs: '' };
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
  }

  rolsClau = [
    { name: 'Responsable de dades (Data Stewart)', resp: '', email: '', phone: '', obs: '' },
    { name: 'Propietari de dades (Data Owner)', resp: '', email: '', phone: '', obs: '' },
    { name: 'Referent de dades (Data Stewart)', resp: 'Gemma Àlvarez', email: 'alvarezmgm@premiadedalt.cat', phone: '936931509', obs: 'Cap de Recursos humans i de Serveis a les persones: sol·licita accés a Informàtica per un treballador nou' },
    { name: 'Referent de dades (Data Stewart)', resp: 'Nuria Riera', email: 'rieran@premiadedalt.cat', phone: '674951891', obs: 'Serveis Socials, demana a Informàtica per afegir un treballador nou' },
    { name: '', resp: 'Teresa Pallarés', email: 'pallarestm@premiadedalt.cat', phone: '670961003', obs: 'Tresoreria i Intervenció, mateixa dinàmica.' },
    { name: '', resp: 'Pedro Obrero Román', email: 'obrerorp@premiadedalt.cat', phone: '607118371', obs: 'Responsable d\'Informàtica que accedeix a les peticions dels diferents departaments' }
  ];

  arees = [
    { name: 'Recursos Humans', resp: '', email: '', phone: '', obs: '' },
    { name: 'Serveis Socials', resp: '', email: '', phone: '', obs: '' },
    { name: 'Tresoreria i Intervenció', resp: '', email: '', phone: '', obs: '' },
    { name: 'Informàtica', resp: '', email: '', phone: '', obs: '' },
    { name: 'Organigrames tècnic i funcional', resp: '', email: '', phone: '', obs: '' }
  ];

  processos = [
    { name: 'Contractes menors', resp: 'Cada departament', email: '', phone: '', obs: 'Contractació' },
    { name: 'Subvencions', resp: 'Cada departament', email: '', phone: '', obs: 'Cada departament gestiona les seves' },
    { name: 'Licitacions', resp: 'Secretaria', email: 'botemmr@premiadedalt.cat', phone: '936931511', obs: '' },
    { name: 'Llicències d\'obres', resp: 'Urbanisme (Lluís Garcia)', email: 'garciajll@premiadedalt.cat', phone: '', obs: '' },
    { name: 'Inscripcions a les Escoles', resp: 'Educació (Eli Gumma)', email: '', phone: '', obs: '' },
    { name: 'Denúncies / Infraccions', resp: 'Policia (Carlos Matallan)', email: '', phone: '', obs: '' },
    { name: 'Altes i baixes de personal', resp: 'Recursos Humans', email: '', phone: '', obs: '' },
    { name: 'Pagament de Nòmines', resp: 'Recursos Humans', email: '', phone: '', obs: '' },
    { name: 'Pagament a Proveïdors', resp: 'Tresoreria', email: '', phone: '', obs: '' }
  ];

  projectes = [
    { name: 'El Pla de Govern 2023 - 2027', resp: '', email: '', phone: '', obs: '' }
  ];

  altres = [
    { name: 'Responsable de Tecnologia', resp: '', email: '', phone: '', obs: '' },
    { name: 'Responsable de Seguretat', resp: '', email: '', phone: '', obs: '' }
  ];

  orgData = [
    { id: '1', parentId: '', name: 'Direcció', position: 'Alta Direcció' },
    { id: '2', parentId: '1', name: 'Sense Assignar', position: 'Responsable de Dades (Data Stewart)' },
    { id: '3', parentId: '1', name: 'Sense Assignar', position: 'Propietari de Dades (Data Owner)' },
    { id: '4', parentId: '2', name: 'Gemma Àlvarez', position: 'Referent de Dades (Recursos Humans)' },
    { id: '5', parentId: '2', name: 'Nuria Riera', position: 'Referent de Dades (Serveis Socials)' },
    { id: '6', parentId: '2', name: 'Teresa Pallarés', position: 'Referent de Dades (Tresoreria i Intervenció)' },
    { id: '7', parentId: '1', name: 'Pedro Obrero Román', position: 'Responsable d\'Informàtica' }
  ];

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
          const bgColor = isHighlighted ? '#e0f2fe' : '#ffffff'; // light blue 100 or white
          const borderColor = isHighlighted ? '#38bdf8' : '#e5e7eb'; // light blue 400 or gray 200
          
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
