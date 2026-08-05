import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { AppModeService } from './services/app-mode.service';
// Level 1
import { Questionari } from './pages/questionari/questionari';
import { Inventari } from './pages/inventari/inventari';
import { Glossari } from './pages/glossari/glossari';
// Level 2 - Questionari
import { MapaResponsables } from './pages/questionari/mapa-responsables/mapa-responsables';
import { FormQuestionari } from './pages/questionari/form-questionari/form-questionari';
import { PlaAccions } from './pages/questionari/pla-accions/pla-accions';
import { Resultat } from './pages/questionari/resultat/resultat';
// Level 2 - Inventari
import { Sistemas } from './pages/inventari/sistemas/sistemas';
import { Entitats } from './pages/inventari/entitats/entitats';
import { Atributs } from './pages/inventari/atributs/atributs';
import { RelacionAtributs } from './pages/inventari/relacion-atributs/relacion-atributs';
import { Llistes } from './pages/inventari/llistes/llistes';
import { Llegenda } from './pages/inventari/llegenda/llegenda';
// Level 2 - Glossari
import { GlossariTable } from './pages/glossari/glossari-table/glossari-table';
import { RelacionGlossari } from './pages/glossari/relacion-glossari/relacion-glossari';
import { LlegendaGlossari } from './pages/glossari/llegenda-glossari/llegenda-glossari';

// Auth / Admin
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';
import { AdminUsuariosComponent } from './pages/admin/usuarios/admin-usuarios';
import { AdminEntidadesComponent } from './pages/admin/entidades/admin-entidades';
import { adminGuard } from './guards/admin.guard';

// En modo DEV se evita forzar el login (p.ej. para webscraping/testing automatizado).
const homeOrLoginRedirect = () => (inject(AppModeService).isDev() ? '/home' : '/login');

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: Layout,
    children: [
      { path: 'home', component: Home },
      { 
        path: 'questionari', 
        component: Questionari,
        children: [
          { path: 'mapa-responsables', component: MapaResponsables },
          { path: 'form', component: FormQuestionari },
          { path: 'pla-accions', component: PlaAccions },
          { path: 'resultat', component: Resultat },
          { path: '', redirectTo: 'mapa-responsables', pathMatch: 'full' }
        ]
      },
      { 
        path: 'inventari', 
        component: Inventari,
        children: [
          { path: 'sistemas', component: Sistemas },
          { path: 'entitats', component: Entitats },
          { path: 'atributs', component: Atributs },
          { path: 'relacion', component: RelacionAtributs },
          { path: 'llistes', component: Llistes },
          { path: 'llegenda', component: Llegenda },
          { path: '', redirectTo: 'sistemas', pathMatch: 'full' }
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
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [adminGuard],
        children: [
          { path: 'usuarios', component: AdminUsuariosComponent },
          { path: 'entidades', component: AdminEntidadesComponent },
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: homeOrLoginRedirect, pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: homeOrLoginRedirect }
];
