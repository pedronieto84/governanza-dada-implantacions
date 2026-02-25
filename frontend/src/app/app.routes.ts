import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
// Level 1
import { Questionari } from './pages/questionari/questionari';
import { Inventari } from './pages/inventari/inventari';
import { Glossari } from './pages/glossari/glossari';
// Level 2 - Questionari
import { MapaResponsables } from './pages/questionari/mapa-responsables/mapa-responsables';
import { Sistemas } from './pages/questionari/sistemas/sistemas';
import { FormQuestionari } from './pages/questionari/form-questionari/form-questionari';
import { Resultat } from './pages/questionari/resultat/resultat';
// Level 2 - Inventari
import { Entitats } from './pages/inventari/entitats/entitats';
import { Atributs } from './pages/inventari/atributs/atributs';
import { RelacionAtributs } from './pages/inventari/relacion-atributs/relacion-atributs';
import { Llistes } from './pages/inventari/llistes/llistes';
import { Llegenda } from './pages/inventari/llegenda/llegenda';
// Level 2 - Glossari
import { GlossariTable } from './pages/glossari/glossari-table/glossari-table';
import { RelacionGlossari } from './pages/glossari/relacion-glossari/relacion-glossari';
import { LlegendaGlossari } from './pages/glossari/llegenda-glossari/llegenda-glossari';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { 
        path: 'questionari', 
        component: Questionari,
        children: [
          { path: 'mapa-responsables', component: MapaResponsables },
          { path: 'sistemas', component: Sistemas },
          { path: 'form', component: FormQuestionari },
          { path: 'resultat', component: Resultat },
          { path: '', redirectTo: 'mapa-responsables', pathMatch: 'full' }
        ]
      },
      { 
        path: 'inventari', 
        component: Inventari,
        children: [
          { path: 'entitats', component: Entitats },
          { path: 'atributs', component: Atributs },
          { path: 'relacion', component: RelacionAtributs },
          { path: 'llistes', component: Llistes },
          { path: 'llegenda', component: Llegenda },
          { path: '', redirectTo: 'entitats', pathMatch: 'full' }
        ]
      },
      { 
        path: 'glossari', 
        component: Glossari,
        children: [
          { path: 'taula', component: GlossariTable },
          { path: 'relacion', component: RelacionGlossari },
          { path: 'llegenda', component: LlegendaGlossari },
          { path: '', redirectTo: 'taula', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'questionari', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
