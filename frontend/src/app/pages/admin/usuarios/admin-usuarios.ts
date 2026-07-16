import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pedro Nieto</td>
            <td>pedro.nieto.sanchez@gmail.com</td>
            <td><div class="badge badge-primary">Admin</div></td>
            <td>Activo</td>
          </tr>
          <tr>
            <td>Usuario Prueba</td>
            <td>usuario@diba.cat</td>
            <td><div class="badge badge-ghost">User</div></td>
            <td>Activo</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminUsuariosComponent {}
