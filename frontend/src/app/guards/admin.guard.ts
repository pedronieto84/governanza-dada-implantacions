import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppModeService } from '../services/app-mode.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const appMode = inject(AppModeService);

  // En modo DEV se salta el login para poder navegar/testear (p.ej. webscraping).
  if (appMode.isDev()) {
    return true;
  }

  return authService.isAdmin$.pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
