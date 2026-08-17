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
import { QuestionariImpacte } from './pages/questionari/questionari-impacte/questionari-impacte';
import { PlaAccionsImpacte } from './pages/questionari/pla-accions-impacte/pla-accions-impacte';
import { ResultatImpacte } from './pages/questionari/resultat-impacte/resultat-impacte';
// Level 2 - Inventari
import { InstruccionsInventari } from './pages/inventari/instruccions/instruccions';
import { TaulaInventari } from './pages/inventari/taula-inventari/taula-inventari';
import { QualitatInventari } from './pages/inventari/qualitat/qualitat';
import { Llistes } from './pages/inventari/llistes/llistes';
import { Llegenda } from './pages/inventari/llegenda/llegenda';
import { RelacioInventaris } from './pages/inventari/relacio-inventaris/relacio-inventaris';
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
import { authGuard } from './guards/auth.guard';

// En modo DEV se evita forzar el login (p.ej. para webscraping/testing automatizado).
const homeOrLoginRedirect = () => (inject(AppModeService).isDev() ? '/home' : '/login');

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
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
          { path: 'questionari-impacte', component: QuestionariImpacte },
          { path: 'pla-accions-impacte', component: PlaAccionsImpacte },
          { path: 'resultat-impacte', component: ResultatImpacte },
          { path: '', redirectTo: 'mapa-responsables', pathMatch: 'full' }
        ]
      },
      { 
        path: 'inventari', 
        component: Inventari,
        children: [
          { path: 'instruccions', component: InstruccionsInventari },
          { path: 'sistemes', component: TaulaInventari, data: { collection: 'sistemes' } },
          { path: 'dominis-dades', component: TaulaInventari, data: { collection: 'dominis' } },
          { path: 'conjunts-dades', component: TaulaInventari, data: { collection: 'conjunts' } },
          {
            path: 'relacio-conjunts-sistemes',
            component: TaulaInventari,
            data: { collection: 'relacions' },
          },
          { path: 'qualitat', component: QualitatInventari },
          { path: 'llegenda', component: Llegenda },
          { path: 'relacio-inventaris', component: RelacioInventaris },
          { path: 'llistes', component: Llistes },
          { path: '', redirectTo: 'sistemes', pathMatch: 'full' }
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
