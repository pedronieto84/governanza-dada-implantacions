import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, catchError, filter, of, switchMap, takeUntil } from 'rxjs';

import { API_BASE } from '../../../api.config';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';
import { StickyStackDirective } from '../../../shared/sticky-stack.directive';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { getHttpErrorCode } from '../../../utils/http-error';
import { toSlug } from '../../../utils/slug';
import {
  IMPACTE_ACTIONS,
  IMPACTE_AMBITS,
  IMPACTE_NIVELLS,
  actionsByAmbit,
} from '../impacte-organitzatiu.model';

interface ImpacteQuestionariPayload {
  answers: Record<string, string>;
  observacions: Record<string, string>;
  evidencies: Record<string, string>;
}

@Component({
  selector: 'app-questionari-impacte',
  imports: [FormsModule, FakeDataButton, StickyStackDirective],
  templateUrl: './questionari-impacte.html',
})
export class QuestionariImpacte implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private municipiActual = '';

  readonly ambits = IMPACTE_AMBITS;
  readonly nivells = IMPACTE_NIVELLS;
  readonly actionsByAmbit = actionsByAmbit;
  answers: Record<string, string> = {};
  observacions: Record<string, string> = {};
  evidencies: Record<string, string> = {};
  activeAmbit = IMPACTE_AMBITS[0] ?? '';

  constructor(
    private http: HttpClient,
    private municipiService: MunicipiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        filter((municipi): municipi is string => !!municipi),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.answers = {};
          this.observacions = {};
          this.evidencies = {};
          return this.http
            .get<Partial<ImpacteQuestionariPayload>>(
              `${API_BASE}/api/data/municipis/${toSlug(municipi)}/questionari-impacte-organitzatiu`,
            )
            .pipe(catchError(() => of<Partial<ImpacteQuestionariPayload>>({})));
        }),
      )
      .subscribe((data) => {
        this.answers = data.answers ?? {};
        this.observacions = data.observacions ?? {};
        this.evidencies = data.evidencies ?? {};
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.scrollContentToTop();
  }

  selectAmbit(ambit: string): void {
    this.activeAmbit = ambit;
    this.scrollContentToTop();
  }

  saveData(): void {
    if (!this.municipiActual) return;
    const payload: ImpacteQuestionariPayload = {
      answers: this.answers,
      observacions: this.observacions,
      evidencies: this.evidencies,
    };
    this.http
      .post(
        `${API_BASE}/api/data/municipis/${toSlug(this.municipiActual)}/questionari-impacte-organitzatiu`,
        payload,
      )
      .subscribe({
        next: () => this.toast.success(),
        error: (error) => {
          console.error('Error saving Qüestionari Impacte Organitzatiu data', error);
          this.toast.error(`Error ${getHttpErrorCode(error)} al intentar guardar el dato`);
        },
      });
  }

  fillFakeData(): void {
    for (const action of IMPACTE_ACTIONS) {
      this.answers[action.key] = (Math.floor(Math.random() * this.nivells.length) + 1).toString();
    }
    this.saveData();
  }

  private scrollContentToTop(): void {
    this.elementRef.nativeElement.closest('main')?.scrollTo({ top: 0 });
  }
}
