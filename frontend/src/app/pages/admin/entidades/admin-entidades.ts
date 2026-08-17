import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { API_BASE } from '../../../api.config';

interface AdminEntity {
  slug: string;
  name: string;
}

@Component({
  selector: 'app-admin-entidades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-xl font-semibold mb-4">Entidades Municipales</h2>
    @if (loadError) {
      <div class="alert alert-error mb-4"><span>{{ loadError }}</span></div>
    }
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Municipio</th>
            <th>Identificador</th>
          </tr>
        </thead>
        <tbody>
          @for (entity of entities; track entity.slug) {
            <tr>
              <td>{{ entity.name }}</td>
              <td><code>{{ entity.slug }}</code></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminEntidadesComponent implements OnInit {
  entities: AdminEntity[] = [];
  loadError = '';

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.http.get<AdminEntity[]>(`${API_BASE}/api/admin/entities`).subscribe({
      next: (entities) => {
        this.entities = entities;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'No se pudieron cargar las entidades.';
        this.cdr.detectChanges();
      },
    });
  }
}
