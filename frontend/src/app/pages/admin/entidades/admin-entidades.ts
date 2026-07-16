import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-entidades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold mb-4">Entidades Municipales</h2>
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Municipio</th>
            <th>Comarca</th>
            <th>Provincia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>081711</td>
            <td>Premià de Dalt</td>
            <td>Maresme</td>
            <td>Barcelona</td>
          </tr>
          <tr>
            <td>080193</td>
            <td>Barcelona</td>
            <td>Barcelonès</td>
            <td>Barcelona</td>
          </tr>
          <tr>
            <td>082662</td>
            <td>Sant Cugat del Vallès</td>
            <td>Vallès Occidental</td>
            <td>Barcelona</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminEntidadesComponent {}
