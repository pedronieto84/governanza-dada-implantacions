import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { API_BASE } from '../api.config';

@Injectable({ providedIn: 'root' })
export class MunicipiService {
  private _municipi = new BehaviorSubject<string>('');
  municipiSeleccionat$ = this._municipi.asObservable();

  get municipiSeleccionat(): string {
    return this._municipi.value;
  }

  constructor(private http: HttpClient) {
    this.http.get<any>(`${API_BASE}/api/data/config`).subscribe({
      next: (data) => {
        if (data?.municipiSeleccionat) {
          this._municipi.next(data.municipiSeleccionat);
        }
      },
      error: () => {}
    });
  }

  selectMunicipi(m: string): void {
    this._municipi.next(m);
    this.http.post(`${API_BASE}/api/data/config`, { municipiSeleccionat: m }).subscribe({
      error: (err) => console.error('Error saving municipi config', err)
    });
  }
}
