import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  // Observable que emite el estado del usuario (null si no está logueado)
  public readonly user$: Observable<User | null> = authState(this.auth);

  // Observable para facilitar si es admin o no
  public readonly isAdmin$: Observable<boolean> = this.user$.pipe(
    map(user => !!user && user.email === 'pedro.nieto.sanchez@gmail.com')
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
