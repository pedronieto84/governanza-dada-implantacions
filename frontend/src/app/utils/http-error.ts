import { HttpErrorResponse } from '@angular/common/http';

/** Extreu un codi curt i llegible d'un error HTTP per mostrar-lo a l'usuari. */
export function getHttpErrorCode(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return String(error.status || error.statusText || 'desconegut');
  }
  return 'desconegut';
}
