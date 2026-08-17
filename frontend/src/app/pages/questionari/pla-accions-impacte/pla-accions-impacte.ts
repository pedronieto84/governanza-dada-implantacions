import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, catchError, filter, forkJoin, of, switchMap, takeUntil } from 'rxjs';

import { API_BASE } from '../../../api.config';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { getHttpErrorCode } from '../../../utils/http-error';
import { toSlug } from '../../../utils/slug';
import {
  IMPACTE_AMBITS,
  actionsByAmbit,
  priorityForImpacteAnswer,
  scoreForImpacteAnswer,
  sumImpacteDificultat,
} from '../impacte-organitzatiu.model';

interface QuestionariPayload { answers?: Record<string, string>; }
interface PlaPayload {
  impactes: Record<string, string>;
  dificultats: Record<string, string>;
  terminis: Record<string, string>;
}

const IMPACTE_OPTIONS = ['1 - Alt', '2 - Mig', '3 - Baix'];
const DIFICULTAT_OPTIONS = ['1 - Baixa', '2 - Mitja', '3 - Alta'];
const TERMINI_OPTIONS = ['Curt termini (0 – 6 Mesos)', 'Mig termini (6 – 18 mesos)', 'Llarg termini (18-36 mesos)', '<No aplica>'];

@Component({
  selector: 'app-pla-accions-impacte',
  imports: [FormsModule, FakeDataButton, StickyStackDirective],
  templateUrl: './pla-accions-impacte.html',
})
export class PlaAccionsImpacte implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private municipiActual = '';
  readonly ambits = IMPACTE_AMBITS;
  readonly actionsByAmbit = actionsByAmbit;
  readonly impacteOptions = IMPACTE_OPTIONS;
  readonly dificultatOptions = DIFICULTAT_OPTIONS;
  readonly terminiOptions = TERMINI_OPTIONS;
  activeAmbit = IMPACTE_AMBITS[0] ?? '';
  answers: Record<string, string> = {};
  impactes: Record<string, string> = {};
  dificultats: Record<string, string> = {};
  terminis: Record<string, string> = {};

  constructor(private http: HttpClient, private municipiService: MunicipiService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.municipiService.municipiSeleccionat$.pipe(
      takeUntil(this.destroy$),
      filter((municipi): municipi is string => !!municipi),
      switchMap((municipi) => {
        this.municipiActual = municipi;
        const slug = toSlug(municipi);
        return forkJoin({
          questionari: this.http.get<QuestionariPayload>(`${API_BASE}/api/data/municipis/${slug}/questionari-impacte-organitzatiu`).pipe(catchError(() => of<QuestionariPayload>({}))),
          pla: this.http.get<Partial<PlaPayload>>(`${API_BASE}/api/data/municipis/${slug}/pla-accions-impacte-organitzatiu`).pipe(catchError(() => of<Partial<PlaPayload>>({}))),
        });
      }),
    ).subscribe(({ questionari, pla }) => {
      this.answers = questionari.answers ?? {};
      this.impactes = pla.impactes ?? {};
      this.dificultats = pla.dificultats ?? {};
      this.terminis = pla.terminis ?? {};
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  saveData(): void {
    if (!this.municipiActual) return;
    const payload: PlaPayload = { impactes: this.impactes, dificultats: this.dificultats, terminis: this.terminis };
    this.http.post(`${API_BASE}/api/data/municipis/${toSlug(this.municipiActual)}/pla-accions-impacte-organitzatiu`, payload).subscribe({
      next: () => this.toast.success(),
      error: (error) => {
        console.error('Error saving Pla d’accions Impacte Organitzatiu data', error);
        this.toast.error(`Error ${getHttpErrorCode(error)} al intentar guardar el dato`);
      },
    });
  }

  nivell(key: string): number | '' { return scoreForImpacteAnswer(this.answers[key]) || ''; }
  prioritat(key: string): number | '' { return priorityForImpacteAnswer(this.answers[key]); }
  impacteDificultat(key: string): number | '' {
    return sumImpacteDificultat(this.impactes[key], this.dificultats[key]);
  }
  fillFakeData(): void {
    for (const ambit of this.ambits) for (const action of actionsByAmbit(ambit)) {
      this.impactes[action.key] = IMPACTE_OPTIONS[Math.floor(Math.random() * IMPACTE_OPTIONS.length)];
      this.dificultats[action.key] = DIFICULTAT_OPTIONS[Math.floor(Math.random() * DIFICULTAT_OPTIONS.length)];
      this.terminis[action.key] = TERMINI_OPTIONS[Math.floor(Math.random() * TERMINI_OPTIONS.length)];
    }
    this.saveData();
  }
}
