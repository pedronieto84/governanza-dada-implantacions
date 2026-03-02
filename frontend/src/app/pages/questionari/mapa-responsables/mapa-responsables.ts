import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
// @ts-ignore
import { OrgChart } from 'd3-org-chart';

@Component({
  selector: 'app-mapa-responsables',
  templateUrl: './mapa-responsables.html',
  styleUrl: './mapa-responsables.css',
  standalone: true,
  imports: [FormsModule]
})
export class MapaResponsables {
  viewMode: 'tabla' | 'organigrama' = 'tabla';
  isFullscreen = false;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  chart: any;

  isModalOpen = false;
  isEditing = false;
  currentEmployee: any = { id: '', parentId: '', name: '', position: '' };

  constructor(private cdr: ChangeDetectorRef) {
    // Expose methods to global scope for D3 node HTML string binding
    (window as any).triggerOrgNodeEdit = (nodeId: string) => this.openEditModal(nodeId);
    (window as any).triggerOrgNodeAdd = (parentId: string) => this.openAddModalWithParent(parentId);
    (window as any).triggerOrgNodeDelete = (nodeId: string) => this.deleteEmployeeById(nodeId);
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
           // We will rely on explicit button clicks rather than node click now
        })
        .nodeContent((d: any) => {
          const nodeId = d.data.id;
          return `
            <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 260px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box; position: relative;" onmouseover="this.style.borderColor='#4338ca'; this.style.boxShadow='0 10px 15px -3px rgba(67, 56, 202, 0.2)';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)';">
              <div style="font-size: 15px; font-weight: 600; color: #111827; text-align: center; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none;">${d.data.name}</div>
              <div style="font-size: 12px; color: #4338ca; font-weight: 500; text-align: center; background-color: #e0e7ff; padding: 4px 10px; border-radius: 9999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; pointer-events: none;">${d.data.position}</div>
              
              <!-- Hover actions overlay -->
              <div style="position: absolute; top: 0; right: 0; padding: 4px; display: flex; gap: 4px;">
                <button onclick="window.triggerOrgNodeEdit('${nodeId}')" title="Editar" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onclick="window.triggerOrgNodeAdd('${nodeId}')" title="Afegir subaltern" style="background: none; border: none; cursor: pointer; color: #6b7280; padding: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
                ${d.data.parentId !== '' ? `
                <button onclick="if(confirm('N\\\\\\'estàs segur d\\\\\\'eliminar aquest node i associar els fills al pare?')) window.triggerOrgNodeDelete('${nodeId}')" title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px;">
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
