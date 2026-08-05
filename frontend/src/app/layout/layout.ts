import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MunicipiService } from '../services/municipi.service';
import { AuthService } from '../services/auth.service';
import { AppModeService } from '../services/app-mode.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  authService = inject(AuthService);
  appModeService = inject(AppModeService);
  municipiSeleccionat = '';
  showMunicipiDropdown = false;
  municipiSearch = '';
  private _sub!: Subscription;

  municipis: string[] = [
    'Abrera', 'Aguilar de Segarra', 'Aiguafreda', 'Alella', 'Alpens',
    'Arenys de Mar', 'Arenys de Munt', 'Argençola', 'Argentona', 'Artés',
    'Avià', 'Avinyó', 'Avinyonet del Penedès', 'Bagà', 'Balenyà',
    'Balsareny', 'Begues', 'Bellprat', 'Berga', 'Bigues i Riells',
    'Borredà', 'Bruc, El', 'Brull, El', 'Cabanyes, Les', 'Cabrera d\'Anoia',
    'Cabrera de Mar', 'Cabrils', 'Calaf', 'Calders', 'Caldes d\'Estrac',
    'Caldes de Montbui', 'Calldetenes', 'Callús', 'Calonge de Segarra',
    'Campins', 'Canet de Mar', 'Canovelles', 'Cànoves i Samalús',
    'Canyamars', 'Capellades', 'Capolat', 'Cardedeu', 'Cardona',
    'Carme', 'Casserres', 'Castell de l\'Areny', 'Castellbell i el Vilar',
    'Castellcir', 'Castelldefels', 'Castellet i la Gornal', 'Castellfollit de Riubregós',
    'Castellfollit del Boix', 'Castellgalí', 'Castellnou de Bages', 'Castellolí',
    'Castellterçol', 'Castellví de la Marca', 'Castellví de Rosanes', 'Centelles',
    'Cercs', 'Cervelló', 'Collbató', 'Collsuspina', 'Copons', 'Corbera de Llobregat',
    'Cornellà de Llobregat', 'Dosrius', 'Esparreguera', 'Esplugues de Llobregat',
    'Espunyola, L\'', 'Estany, L\'', 'Figaró-Montmany', 'Fígols', 'Fogars de la Selva',
    'Fogars de Montclús', 'Folgueroles', 'Fonollosa', 'Font-rubí',
    'Franqueses del Vallès, Les', 'Gaià', 'Gallifa', 'Gavà',
    'Gelida', 'Gironella', 'Gisclareny', 'Granada, La', 'Granera',
    'Granollers', 'Gualba', 'Guardiola de Berguedà', 'Gurb',
    'Hospitalet de Llobregat, L\'', 'Igualada', 'Jorba', 'Llacuna, La',
    'Llagosta, La', 'Lliçà d\'Amunt', 'Lliçà de Vall', 'Llinars del Vallès',
    'Lluçà', 'Malgrat de Mar', 'Malla', 'Manlleu', 'Manresa',
    'Marganell', 'Martorelles', 'Martorell', 'Masies de Roda, Les',
    'Masies de Voltregà, Les', 'Masnou, El', 'Masquefa', 'Matadepera',
    'Mataró', 'Mediona', 'Moià', 'Molins de Rei', 'Mollet del Vallès',
    'Monistrol de Calders', 'Monistrol de Montserrat', 'Montcada i Reixac',
    'Montesquiu', 'Montgat', 'Montmajor', 'Montmaneu', 'Montmeló',
    'Montornès del Vallès', 'Montseny', 'Muntanyola', 'Mura',
    'Navarcles', 'Navàs', 'Nou de Berguedà, La', 'Òdena',
    'Olèrdola', 'Olesa de Bonesvalls', 'Olesa de Montserrat', 'Olivella',
    'Olost', 'Olvan', 'Orís', 'Oristà', 'Orpí', 'Pacs del Penedès',
    'Palafolls', 'Palau-solità i Plegamans', 'Pallejà', 'Pallols',
    'Papiol, El', 'Parets del Vallès', 'Piera', 'Pineda de Mar',
    'Pla del Penedès, El', 'Pobla de Claramunt, La', 'Pobla de Lillet, La',
    'Polinyà', 'Pont de Vilomara i Rocafort, El', 'Pontons', 'Prat de Llobregat, El',
    'Prats de Lluçanès', 'Prats de Rei, Els', 'Premià de Dalt', 'Premià de Mar',
    'Puig-reig', 'Puigdàlber', 'Pujalt', 'Quar, La', 'Rellinars',
    'Ripollet', 'Roca del Vallès, La', 'Rubí', 'Rubió',
    'Rupit i Pruit', 'Sagàs', 'Sant Adrià de Besòs', 'Sant Agustí de Lluçanès',
    'Sant Andreu de la Barca', 'Sant Andreu de Llavaneres', 'Sant Antoni de Vilamajor',
    'Sant Bartomeu del Grau', 'Sant Boi de Llobregat', 'Sant Boi de Lluçanès',
    'Sant Cebrià de Vallalta', 'Sant Climent de Llobregat', 'Sant Climent Sescebes',
    'Sant Cugat del Vallès', 'Sant Cugat Sesgarrigues', 'Sant Esteve de Palautordera',
    'Sant Esteve Sesrovires', 'Sant Feliu de Codines', 'Sant Feliu de Llobregat',
    'Sant Feliu Sasserra', 'Sant Font', 'Sant Fruitós de Bages',
    'Sant Hipòlit de Voltregà', 'Sant Iscle de Vallalta', 'Sant Jaume de Frontanyà',
    'Sant Joan de Vilatorrada', 'Sant Joan Despí', 'Sant Julià de Cerdanyola',
    'Sant Julià de Vilatorta', 'Sant Just Desvern', 'Sant Llorenç d\'Hortons',
    'Sant Llorenç Savall', 'Sant Martí d\'Albars', 'Sant Martí de Centelles',
    'Sant Martí de Tous', 'Sant Martí Sarroca', 'Sant Martí Sesgueioles',
    'Sant Mateu de Bages', 'Sant Pere de Ribes', 'Sant Pere de Riudebitlles',
    'Sant Pere de Torelló', 'Sant Pere de Vilamajor', 'Sant Pere Sallavinera',
    'Sant Pol de Mar', 'Sant Quintí de Mediona', 'Sant Quirze del Vallès',
    'Sant Quirze de Besora', 'Sant Sadurní d\'Anoia', 'Sant Salvador de Guardiola',
    'Sant Vicenç de Castellet', 'Sant Vicenç de Montalt', 'Sant Vicenç de Torelló',
    'Sant Vicenç dels Horts', 'Santa Cecília de Voltregà', 'Santa Coloma de Cervelló',
    'Santa Coloma de Gramenet', 'Santa Eulàlia de Riuprimer', 'Santa Eulàlia de Ronçana',
    'Santa Fe del Penedès', 'Santa Margarida de Montbui', 'Santa Margarida i els Monjos',
    'Santa Maria de Besora', 'Santa Maria de Corcó', 'Santa Maria de Martorelles',
    'Santa Maria de Merlès', 'Santa Maria de Miralles', 'Santa Maria de Palautordera',
    'Santa Perpètua de Mogoda', 'Santa Susanna', 'Santpedor', 'Sentmenat',
    'Seva', 'Sitges', 'Sobremunt', 'Sora', 'Subirats', 'Súria',
    'Tagamanent', 'Talamanca', 'Taradell', 'Tavèrnoles', 'Tavertet',
    'Teià', 'Terrassa', 'Tiana', 'Tona', 'Torelló', 'Torre de Claramunt, La',
    'Torrelavit', 'Torrelles de Foix', 'Torrelles de Llobregat', 'Ullastrell',
    'Vacarisses', 'Vallbona d\'Anoia', 'Vallcebre', 'Vallgorguina',
    'Vallirana', 'Vallromanes', 'Vic', 'Viladecans', 'Viladecavalls',
    'Vilafranca del Penedès', 'Vilalba Sasserra', 'Vilanova del Camí',
    'Vilanova del Vallès', 'Vilanova i la Geltrú', 'Vilassar de Dalt',
    'Vilassar de Mar', 'Vilobí del Penedès', 'Viver i Serrateix'
  ];

  get municipisFiltered() {
    const q = this.municipiSearch.toLowerCase().trim();
    if (!q) return this.municipis;
    return this.municipis.filter(m => m.toLowerCase().includes(q));
  }

  constructor(private municipiService: MunicipiService) {}

  ngOnInit() {
    this._sub = this.municipiService.municipiSeleccionat$.subscribe(m => {
      this.municipiSeleccionat = m;
    });
  }

  ngOnDestroy() {
    this._sub?.unsubscribe();
  }

  selectMunicipi(m: string) {
    this.municipiService.selectMunicipi(m);
    this.showMunicipiDropdown = false;
    this.municipiSearch = '';
  }
}
