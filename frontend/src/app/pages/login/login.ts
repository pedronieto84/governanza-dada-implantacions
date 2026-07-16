import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-full max-w-sm bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold justify-center mb-2">Bienvenido</h2>
          <p class="text-center text-sm text-base-content/70 mb-6">
            {{ isRegistering ? 'Crea una cuenta para acceder' : 'Inicia sesión para continuar' }}
          </p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Correo electrónico</span>
              </label>
              <input 
                type="email" 
                formControlName="email"
                placeholder="tu@email.com" 
                class="input input-bordered w-full" 
                [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
            </div>
            
            <div class="form-control" *ngIf="!isResettingPassword">
              <label class="label">
                <span class="label-text">Contraseña</span>
              </label>
              <input 
                type="password" 
                formControlName="password"
                placeholder="********" 
                class="input input-bordered w-full" 
                [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <label class="label" *ngIf="!isRegistering">
                <a href="javascript:void(0)" (click)="toggleResetPassword()" class="label-text-alt link link-hover text-primary">¿Olvidaste tu contraseña?</a>
              </label>
            </div>

            <div *ngIf="errorMessage" class="alert alert-error text-sm p-3 rounded-lg mt-2">
              <span>{{ errorMessage }}</span>
            </div>
            <div *ngIf="successMessage" class="alert alert-success text-sm p-3 rounded-lg mt-2">
              <span>{{ successMessage }}</span>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full mt-2" 
              [disabled]="loginForm.invalid || isLoading"
            >
              <span *ngIf="isLoading" class="loading loading-spinner loading-sm"></span>
              <span *ngIf="!isLoading">
                {{ isResettingPassword ? 'Recuperar contraseña' : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión') }}
              </span>
            </button>
          </form>

          <div class="divider text-sm text-base-content/50" *ngIf="!isResettingPassword">O</div>

          <button 
            *ngIf="!isResettingPassword"
            class="btn btn-outline w-full gap-2" 
            (click)="loginWithGoogle()"
            [disabled]="isLoading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Continuar con Google
          </button>

          <div class="mt-4 text-center text-sm">
            <ng-container *ngIf="isResettingPassword">
              <a href="javascript:void(0)" (click)="toggleResetPassword()" class="link link-primary">Volver al inicio de sesión</a>
            </ng-container>
            <ng-container *ngIf="!isResettingPassword">
              <span class="text-base-content/70">
                {{ isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?' }}
              </span>
              <a href="javascript:void(0)" (click)="toggleMode()" class="link link-primary ml-1">
                {{ isRegistering ? 'Inicia sesión' : 'Regístrate' }}
              </a>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isRegistering = false;
  isResettingPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.resetMessages();
    if (!this.isRegistering) {
       this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  toggleResetPassword() {
    this.isResettingPassword = !this.isResettingPassword;
    this.isRegistering = false;
    this.resetMessages();
    
    const passwordControl = this.loginForm.get('password');
    if (this.isResettingPassword) {
      passwordControl?.clearValidators();
    } else {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    passwordControl?.updateValueAndValidity();
  }

  resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.resetMessages();

    const { email, password } = this.loginForm.value;

    try {
      if (this.isResettingPassword) {
        await this.authService.resetPassword(email);
        this.successMessage = 'Se ha enviado un correo para restablecer la contraseña (revisa la carpeta de spam).';
      } else if (this.isRegistering) {
        await this.authService.registerWithEmail(email, password);
        this.router.navigate(['/home']);
      } else {
        await this.authService.loginWithEmail(email, password);
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('Error de autenticación', error);
      this.handleAuthError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    this.resetMessages();
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error en el login con Google', error);
      this.errorMessage = 'No se pudo iniciar sesión con Google.';
    } finally {
      this.isLoading = false;
    }
  }

  private handleAuthError(errorCode: string) {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        break;
      case 'auth/email-already-in-use':
        this.errorMessage = 'Este correo ya está registrado.';
        break;
      case 'auth/weak-password':
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'El formato del correo es inválido.';
        break;
      default:
        this.errorMessage = 'Ha ocurrido un error inesperado al autenticarse. Revisa la consola para más detalles.';
    }
  }
}
