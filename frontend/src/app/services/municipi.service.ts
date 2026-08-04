import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { API_BASE } from '../api.config';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MunicipiService {
  private readonly storageKey = 'municipiSeleccionat';
  private readonly defaultMunicipi = environment.production ? '' : 'Premià de Dalt';
  private _municipi = new BehaviorSubject<string>(
    localStorage.getItem(this.storageKey) ?? this.defaultMunicipi,
  );
  municipiSeleccionat$ = this._municipi.asObservable();

  get municipiSeleccionat(): string {
    return this._municipi.value;
  }

  constructor(private http: HttpClient) {
    if (!environment.production) return;

    this.http.get<any>(`${API_BASE}/api/data/config`).subscribe({
      next: (data) => {
        if (data?.municipiSeleccionat) {
          localStorage.setItem(this.storageKey, data.municipiSeleccionat);
          this._municipi.next(data.municipiSeleccionat);
        }
      },
      error: () => {}
    });
  }

  selectMunicipi(m: string): void {
    localStorage.setItem(this.storageKey, m);
    this._municipi.next(m);
    if (!environment.production) return;

    this.http.post(`${API_BASE}/api/data/config`, { municipiSeleccionat: m }).subscribe({
      error: (err) => console.error('Error saving municipi config', err)
    });
  }
}
