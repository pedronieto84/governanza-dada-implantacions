import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, catchError, filter, of, switchMap, takeUntil } from 'rxjs';

import { API_BASE } from '../../../api.config';
import { RadarChart } from '../../../shared/radar-chart/radar-chart';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';
import {
  IMPACTE_ACTIONS,
  ImpacteAmbitResultat,
  averageAnswered,
  calculateImpacteResults,
  scoreForImpacteAnswer,
} from '../impacte-organitzatiu.model';

interface QuestionariPayload { answers?: Record<string, string>; }

@Component({
  selector: 'app-resultat-impacte',
  imports: [RadarChart],
  templateUrl: './resultat-impacte.html',
  styleUrl: '../resultat/resultat.css',
})
export class ResultatImpacte implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  municipiActual = '';
  answers: Record<string, string> = {};
  ambits: ImpacteAmbitResultat[] = calculateImpacteResults({});
  ambitLabels = this.ambits.map((ambit) => ambit.nom);
  ambitScores = this.ambits.map((ambit) => ambit.puntuacio);
  isLoading = false;

  constructor(private http: HttpClient, private municipiService: MunicipiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.municipiService.municipiSeleccionat$.pipe(
      takeUntil(this.destroy$),
      filter((municipi): municipi is string => !!municipi),
      switchMap((municipi) => {
        this.municipiActual = municipi;
        this.isLoading = true;
        return this.http.get<QuestionariPayload>(`${API_BASE}/api/data/municipis/${toSlug(municipi)}/questionari-impacte-organitzatiu`).pipe(catchError(() => of<QuestionariPayload>({})));
      }),
    ).subscribe((data) => {
      this.answers = data.answers ?? {};
      this.ambits = calculateImpacteResults(this.answers);
      this.ambitLabels = this.ambits.map((ambit) => ambit.nom);
      this.ambitScores = this.ambits.map((ambit) => ambit.puntuacio);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  get completedQuestions(): number { return IMPACTE_ACTIONS.filter((action) => scoreForImpacteAnswer(this.answers[action.key]) > 0).length; }
  get totalQuestions(): number { return IMPACTE_ACTIONS.length; }
  get globalScore(): number { return averageAnswered(this.ambits.map((ambit) => ambit.puntuacio)); }
  formatScore(score: number): string { return score.toFixed(1).replace('.', ','); }
}
