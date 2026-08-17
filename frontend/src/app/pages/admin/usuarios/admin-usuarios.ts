import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { API_BASE } from '../../../api.config';

interface AdminEntity {
  slug: string;
  name: string;
}

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  disabled: boolean;
  municipalitySlugs: string[];
}

interface NewAdminUser {
  displayName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  municipalitySlugs: string[];
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between gap-3 mb-4">
      <h2 class="text-xl font-semibold">Gestión de Usuarios</h2>
      <button
        type="button"
        class="btn btn-primary btn-sm btn-square"
        title="Crear usuario"
        aria-label="Crear usuario"
        (click)="openCreateDialog()">
        <span aria-hidden="true" class="text-xl">+</span>
      </button>
    </div>

    @if (loadError) {
      <div class="alert alert-error mb-4"><span>{{ loadError }}</span></div>
    }

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Entidades</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users; track user.uid) {
            <tr>
              <td>{{ user.displayName || 'Sin nombre' }}</td>
              <td>{{ user.email }}</td>
              <td>
                <div class="badge" [class.badge-primary]="user.isAdmin" [class.badge-ghost]="!user.isAdmin">
                  {{ user.isAdmin ? 'Admin' : 'Usuario' }}
                </div>
              </td>
              <td class="min-w-72">
                @if (user.isAdmin) {
                  <span class="text-sm text-base-content/70">Todas las entidades</span>
                } @else {
                  <select
                    multiple
                    class="select select-bordered w-full min-h-28"
                    aria-label="Entidades permitidas"
                    [ngModel]="user.municipalitySlugs"
                    (ngModelChange)="updateEntities(user, $event)"
                    [disabled]="savingUsers.has(user.uid)">
                    @for (entity of entities; track entity.slug) {
                      <option [value]="entity.slug">{{ entity.name }}</option>
                    }
                  </select>
                  <div class="mt-1 text-xs min-h-4">
                    @if (savingUsers.has(user.uid)) {
                      <span class="text-info">Guardando...</span>
                    } @else if (saveErrors[user.uid]) {
                      <span class="text-error">{{ saveErrors[user.uid] }}</span>
                    } @else {
                      <span class="text-base-content/50">
                        {{ user.municipalitySlugs.length }} entidad(es) asignada(s)
                      </span>
                    }
                  </div>
                }
              </td>
              <td>
                <span [class.text-error]="user.disabled">
                  {{ user.disabled ? 'Bloqueado' : 'Activo' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <dialog class="modal" [class.modal-open]="createDialogOpen">
      <div class="modal-box max-w-2xl">
        <h3 class="text-lg font-bold mb-4">Crear usuario</h3>

        @if (createError) {
          <div class="alert alert-error mb-4"><span>{{ createError }}</span></div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label class="form-control">
            <span class="label-text mb-1">Nombre</span>
            <input
              type="text"
              class="input input-bordered"
              autocomplete="name"
              [ngModel]="newUser.displayName"
              (ngModelChange)="newUser.displayName = $event" />
          </label>
          <label class="form-control">
            <span class="label-text mb-1">Correo electrónico</span>
            <input
              type="email"
              class="input input-bordered"
              autocomplete="off"
              [ngModel]="newUser.email"
              (ngModelChange)="newUser.email = $event" />
          </label>
          <label class="form-control">
            <span class="label-text mb-1">Contraseña temporal</span>
            <input
              type="password"
              class="input input-bordered"
              minlength="6"
              autocomplete="new-password"
              [ngModel]="newUser.password"
              (ngModelChange)="newUser.password = $event" />
            <span class="text-xs text-base-content/60 mt-1">Mínimo 6 caracteres</span>
          </label>
          <label class="form-control">
            <span class="label-text mb-1">Permisos</span>
            <select
              class="select select-bordered"
              [ngModel]="newUser.isAdmin"
              (ngModelChange)="newUser.isAdmin = $event">
              <option [ngValue]="false">Usuario</option>
              <option [ngValue]="true">Administrador</option>
            </select>
          </label>
          @if (!newUser.isAdmin) {
            <label class="form-control lg:col-span-2">
              <span class="label-text mb-1">Entidades con acceso</span>
              <select
                multiple
                class="select select-bordered min-h-32"
                [ngModel]="newUser.municipalitySlugs"
                (ngModelChange)="newUser.municipalitySlugs = $event">
                @for (entity of entities; track entity.slug) {
                  <option [value]="entity.slug">{{ entity.name }}</option>
                }
              </select>
              <span class="text-xs text-base-content/60 mt-1">
                {{ newUser.municipalitySlugs.length }} entidad(es) seleccionada(s)
              </span>
            </label>
          } @else {
            <div class="lg:col-span-2 text-sm text-base-content/70">
              Los administradores tienen acceso a todas las entidades.
            </div>
          }
        </div>

        <div class="modal-action">
          <button type="button" class="btn" [disabled]="creatingUser" (click)="closeCreateDialog()">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="creatingUser || !canCreateUser"
            (click)="createUser()">
            @if (creatingUser) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            Crear usuario
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" aria-label="Cerrar" (click)="closeCreateDialog()">Cerrar</button>
      </form>
    </dialog>
  `,
})
export class AdminUsuariosComponent implements OnInit {
  users: AdminUser[] = [];
  entities: AdminEntity[] = [];
  savingUsers = new Set<string>();
  saveErrors: Record<string, string> = {};
  loadError = '';
  createDialogOpen = false;
  creatingUser = false;
  createError = '';
  newUser = this.emptyNewUser();

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      users: this.http.get<AdminUser[]>(`${API_BASE}/api/admin/users`),
      entities: this.http.get<AdminEntity[]>(`${API_BASE}/api/admin/entities`),
    }).subscribe({
      next: ({ users, entities }) => {
        this.users = users;
        this.entities = entities;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'No se pudieron cargar los usuarios y las entidades.';
        this.cdr.detectChanges();
      },
    });
  }

  updateEntities(user: AdminUser, municipalitySlugs: string[]): void {
    const previousSlugs = user.municipalitySlugs;
    user.municipalitySlugs = [...municipalitySlugs];
    this.savingUsers.add(user.uid);
    delete this.saveErrors[user.uid];

    this.http
      .patch<{ municipalitySlugs: string[] }>(
        `${API_BASE}/api/admin/users/${encodeURIComponent(user.uid)}/access`,
        { municipalitySlugs: user.municipalitySlugs },
      )
      .subscribe({
        next: (response) => {
          user.municipalitySlugs = response.municipalitySlugs;
          this.savingUsers.delete(user.uid);
          this.cdr.detectChanges();
        },
        error: () => {
          user.municipalitySlugs = previousSlugs;
          this.savingUsers.delete(user.uid);
          this.saveErrors[user.uid] = 'No se pudo guardar la asignación.';
          this.cdr.detectChanges();
        },
      });
  }

  get canCreateUser(): boolean {
    return (
      !!this.newUser.displayName.trim() &&
      /^\S+@\S+\.\S+$/.test(this.newUser.email.trim()) &&
      this.newUser.password.length >= 6
    );
  }

  openCreateDialog(): void {
    this.newUser = this.emptyNewUser();
    this.createError = '';
    this.createDialogOpen = true;
  }

  closeCreateDialog(): void {
    if (this.creatingUser) return;
    this.createDialogOpen = false;
  }

  createUser(): void {
    if (!this.canCreateUser || this.creatingUser) return;

    this.creatingUser = true;
    this.createError = '';
    const payload = {
      ...this.newUser,
      displayName: this.newUser.displayName.trim(),
      email: this.newUser.email.trim(),
      municipalitySlugs: this.newUser.isAdmin
        ? []
        : this.newUser.municipalitySlugs,
    };

    this.http.post<AdminUser>(`${API_BASE}/api/admin/users`, payload).subscribe({
      next: (user) => {
        this.users = [...this.users, user].sort((left, right) =>
          left.displayName.localeCompare(right.displayName, 'es'),
        );
        this.creatingUser = false;
        this.createDialogOpen = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.creatingUser = false;
        this.createError =
          'No se pudo crear el usuario. Comprueba que el correo no esté registrado.';
        this.cdr.detectChanges();
      },
    });
  }

  private emptyNewUser(): NewAdminUser {
    return {
      displayName: '',
      email: '',
      password: '',
      isAdmin: false,
      municipalitySlugs: [],
    };
  }
}