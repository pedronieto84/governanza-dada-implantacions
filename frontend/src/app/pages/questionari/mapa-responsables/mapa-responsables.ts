import { Component, ElementRef, ViewChild } from '@angular/core';
// @ts-ignore
import { OrgChart } from 'd3-org-chart';

@Component({
  selector: 'app-mapa-responsables',
  templateUrl: './mapa-responsables.html',
  styleUrl: './mapa-responsables.css',
  standalone: true
})
export class MapaResponsables {
  viewMode: 'tabla' | 'organigrama' = 'tabla';
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  chart: any;

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
        .nodeContent((d: any) => {
          return `
            <div style="font-family: 'Inter', sans-serif; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 260px; height: 100px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box;">
              <div style="font-size: 15px; font-weight: 600; color: #111827; text-align: center; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${d.data.name}</div>
              <div style="font-size: 12px; color: #4338ca; font-weight: 500; text-align: center; background-color: #e0e7ff; padding: 4px 10px; border-radius: 9999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${d.data.position}</div>
            </div>
          `;
        })
        .render();
    } else {
      this.chart.render();
    }
  }
}
