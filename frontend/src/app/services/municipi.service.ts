import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService, AccessProfile } from './auth.service';
import { toSlug } from '../utils/slug';

@Injectable({ providedIn: 'root' })
export class MunicipiService {
  private readonly storageKey = 'municipiSeleccionat';
  private _municipi = new BehaviorSubject<string>('');
  private accessProfile: AccessProfile | null = null;
  municipiSeleccionat$ = this._municipi.asObservable();

  get municipiSeleccionat(): string {
    return this._municipi.value;
  }

  constructor(authService: AuthService) {
    authService.profile$.subscribe((profile) => {
      this.accessProfile = profile;
      const storedMunicipality = localStorage.getItem(this.storageKey) ?? '';
      if (storedMunicipality && this.canAccessMunicipi(storedMunicipality)) {
        this._municipi.next(storedMunicipality);
      } else {
        localStorage.removeItem(this.storageKey);
        this._municipi.next('');
      }
    });
  }

  selectMunicipi(m: string): void {
    if (!this.canAccessMunicipi(m)) {
      console.warn('Municipality selection denied');
      return;
    }
    localStorage.setItem(this.storageKey, m);
    this._municipi.next(m);
  }

  canAccessMunicipi(municipality: string): boolean {
    if (!this.accessProfile) return false;
    return (
      this.accessProfile.isAdmin ||
      this.accessProfile.municipalitySlugs.includes(toSlug(municipality))
    );
  }
}
