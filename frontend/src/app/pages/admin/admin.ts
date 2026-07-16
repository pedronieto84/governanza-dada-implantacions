import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="h-full flex flex-col">
      <h1 class="text-3xl font-bold mb-6">Administración</h1>
      
      <div class="tabs tabs-boxed mb-6 bg-base-100 p-2 inline-flex">
        <a routerLink="usuarios" routerLinkActive="tab-active" class="tab text-lg">Usuarios</a>
        <a routerLink="entidades" routerLinkActive="tab-active" class="tab text-lg">Entidades</a>
      </div>

      <div class="flex-1 bg-base-100 rounded-box p-6 shadow-sm">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AdminComponent {}
