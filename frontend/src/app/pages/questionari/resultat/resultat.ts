import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, catchError, filter, of, switchMap, takeUntil } from 'rxjs';

import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { toSlug } from '../../../utils/slug';

export interface ProcesResultat {
  nom: string;
  preguntes: string[];
  puntuacio: number;
}

export interface AmbitResultat {
  nom: string;
  processos: ProcesResultat[];
  puntuacio: number;
}

interface QuestionariPayload {
  answers?: Record<string, string>;
}

const RESULTAT_STRUCTURE = [
  {
    nom: 'Govern',
    processos: [
      { nom: "Establiment d'estàndards, polítiques, bones pràctiques i procediments", preguntes: ['GA01', 'GA02'] },
      { nom: "Establiment d'estratègies de dades", preguntes: ['GB01', 'GB02'] },
      { nom: "Establiment d'estructures organitzacionals", preguntes: ['GC01'] },
      { nom: 'Gestió de recursos humans', preguntes: ['GD01', 'GD02', 'GD03'] },
    ],
  },
  {
    nom: 'Gestió de dades',
    processos: [
      { nom: 'Gestió de seguretat de dades', preguntes: ['MA01', 'MA02'] },
      { nom: 'Gestió de dades històriques', preguntes: ['MB01'] },
      { nom: 'Gestió de fonts i destinacions de dades', preguntes: ['MC01', 'MC02'] },
      { nom: 'Gestió de la integració de les dades', preguntes: ['MD01'] },
      { nom: 'Gestió de Dades Mestre i Dades de Referència', preguntes: ['ME01'] },
    ],
  },
  {
    nom: 'Qualitat de la dada',
    processos: [
      { nom: "Establiment d'estàndards, polítiques, bones pràctiques i procediments", preguntes: ['QA01'] },
      { nom: 'Control i monitorització de la qualitat de les dades', preguntes: ['QB01'] },
      { nom: 'Planificació de la qualitat de les dades', preguntes: ['QC01'] },
    ],
  },
];

export function calculateQuestionariResults(
  answers: Record<string, string>,
): AmbitResultat[] {
  const questionScore = (id: string): number => {
    const score = Number(answers[id]);
    return score >= 1 && score <= 4 ? score : 0;
  };

  return RESULTAT_STRUCTURE.map((ambit) => {
    const processos = ambit.processos.map((proces) => ({
      ...proces,
      puntuacio: average(proces.preguntes.map(questionScore)),
    }));
    return {
      nom: ambit.nom,
      processos,
      puntuacio: average(processos.map((proces) => proces.puntuacio)),
    };
  });
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

@Component({
  selector: 'app-resultat',
  imports: [],
  templateUrl: './resultat.html',
  styleUrl: './resultat.css',
})
export class Resultat {
  private destroy$ = new Subject<void>();

  readonly levels = [1, 2, 3, 4];
  readonly questionIds = RESULTAT_STRUCTURE.flatMap((ambit) =>
    ambit.processos.flatMap((proces) => proces.preguntes),
  );

  municipiActual = '';
  answers: Record<string, string> = {};
  ambits: AmbitResultat[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private municipiService: MunicipiService,
  ) {
    this.calculateResults();
  }

  ngOnInit(): void {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        filter((municipi): municipi is string => !!municipi),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.isLoading = true;
          return this.http
            .get<QuestionariPayload>(
              `${API_BASE}/api/data/municipis/${toSlug(municipi)}/questionari`,
            )
            .pipe(catchError(() => of({ answers: {} })));
        }),
      )
      .subscribe((data) => {
        this.answers = data.answers ?? {};
        this.calculateResults();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get completedQuestions(): number {
    return this.questionIds.filter((id) => this.scoreForQuestion(id) > 0).length;
  }

  get globalScore(): number {
    return average(this.ambits.map((ambit) => ambit.puntuacio));
  }

  get isComplete(): boolean {
    return this.completedQuestions === this.questionIds.length;
  }

  scoreForQuestion(id: string): number {
    const score = Number(this.answers[id]);
    return score >= 1 && score <= 4 ? score : 0;
  }

  formatScore(score: number): string {
    return score.toFixed(1).replace('.', ',');
  }

  radarGridPoints(itemCount: number, level: number): string {
    return this.radarPoints(new Array(itemCount).fill(level));
  }

  radarPoints(scores: number[]): string {
    return scores.map((score, index) => this.radarPoint(index, scores.length, score)).join(' ');
  }

  axisEnd(index: number, itemCount: number): { x: number; y: number } {
    return this.pointAt(index, itemCount, 4);
  }

  labelPoint(index: number, itemCount: number): { x: number; y: number } {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / itemCount;
    return { x: 100 + 86 * Math.cos(angle), y: 100 + 86 * Math.sin(angle) };
  }

  private calculateResults(): void {
    this.ambits = calculateQuestionariResults(this.answers);
  }

  private radarPoint(index: number, itemCount: number, score: number): string {
    const point = this.pointAt(index, itemCount, score);
    return `${point.x},${point.y}`;
  }

  private pointAt(index: number, itemCount: number, score: number): { x: number; y: number } {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / itemCount;
    const radius = 68 * (score / 4);
    return { x: 100 + radius * Math.cos(angle), y: 100 + radius * Math.sin(angle) };
  }

}
