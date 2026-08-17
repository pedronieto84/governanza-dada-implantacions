import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, concatMap, filter, of, Subject, switchMap } from 'rxjs';

import { API_BASE } from '../../api.config';
import { MunicipiService } from '../../services/municipi.service';
import { ToastService } from '../../services/toast.service';
import { getHttpErrorCode } from '../../utils/http-error';
import { toSlug } from '../../utils/slug';
import {
  emptyInventari3b,
  Inventari3bData,
  InventariCollection,
  InventariRow,
} from './inventari-3b.model';

@Injectable({ providedIn: 'root' })
export class Inventari3bService {
  readonly data = signal<Inventari3bData>(emptyInventari3b());
  readonly loading = signal(false);

  private municipiActual = '';
  private readonly saveRequests = new Subject<{ slug: string; data: Inventari3bData }>();

  constructor(
    private readonly http: HttpClient,
    private readonly municipiService: MunicipiService,
    private readonly toast: ToastService,
  ) {
    this.municipiService.municipiSeleccionat$
      .pipe(
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.data.set(emptyInventari3b());
          if (!municipi) {
            this.loading.set(false);
            return of(null);
          }
          this.loading.set(true);
          return this.http
            .get<Partial<Inventari3bData>>(
              `${API_BASE}/api/data/municipis/${toSlug(municipi)}/inventari-3b`,
            )
            .pipe(catchError(() => of(null)));
        }),
      )
      .subscribe((payload) => {
        this.data.set(this.normalise(payload));
        this.loading.set(false);
      });

    this.saveRequests
      .pipe(
        filter((request) => !!request.slug),
        concatMap((request) =>
          this.http
            .post(`${API_BASE}/api/data/municipis/${request.slug}/inventari-3b`, request.data)
            .pipe(
              catchError((error) => {
                this.toast.error(
                  `Error ${getHttpErrorCode(error)} al intentar guardar l'inventari 3B`,
                );
                return of(null);
              }),
            ),
        ),
      )
      .subscribe();
  }

  update(collection: InventariCollection, index: number, key: string, value: string): void {
    this.data.update((current) => {
      const rows = current[collection].map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      );
      return { ...current, [collection]: rows };
    });
    this.saveData();
  }

  add(collection: InventariCollection): void {
    this.data.update((current) => ({
      ...current,
      [collection]: [...current[collection], {}],
    }));
    this.saveData();
  }

  remove(collection: InventariCollection, index: number): void {
    this.data.update((current) => ({
      ...current,
      [collection]: current[collection].filter((_, rowIndex) => rowIndex !== index),
    }));
    this.saveData();
  }

  private saveData(): void {
    if (!this.municipiActual) return;
    this.saveRequests.next({
      slug: toSlug(this.municipiActual),
      data: structuredClone(this.data()),
    });
  }

  private normalise(payload: Partial<Inventari3bData> | null): Inventari3bData {
    const data = emptyInventari3b();
    for (const collection of Object.keys(data) as InventariCollection[]) {
      data[collection] = Array.isArray(payload?.[collection])
        ? payload[collection].map((row) => ({ ...(row as InventariRow) }))
        : [];
    }
    return data;
  }
}