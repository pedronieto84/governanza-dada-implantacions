import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.includes('/api/')) {
    return next(request);
  }

  const auth = inject(Auth);
  return authState(auth).pipe(
    take(1),
    switchMap((user) => {
      if (!user) return next(request);
      return from(user.getIdToken()).pipe(
        switchMap((token) =>
          next(
            request.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            }),
          ),
        ),
      );
    }),
  );
};