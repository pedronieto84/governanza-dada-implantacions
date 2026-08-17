import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { API_BASE } from '../api.config';

export interface AccessProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  municipalitySlugs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private http = inject(HttpClient);

  // Observable que emite el estado del usuario (null si no está logueado)
  public readonly user$: Observable<User | null> = authState(this.auth);

  public readonly profile$: Observable<AccessProfile | null> = this.user$.pipe(
    switchMap((user) =>
      user
        ? this.http
            .get<AccessProfile>(`${API_BASE}/api/auth/me`)
            .pipe(catchError(() => of(null)))
        : of(null),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public readonly isAdmin$: Observable<boolean> = this.profile$.pipe(
    map((profile) => profile?.isAdmin ?? false),
  );

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async loginWithEmail(email: string, pass: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, pass);
  }

  async registerWithEmail(email: string, pass: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, pass);
  }
  
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
