import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, catchError, forkJoin, of } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { API_BASE } from '../../../api.config';
import { MunicipiService } from '../../../services/municipi.service';
import { ToastService } from '../../../services/toast.service';
import { toSlug } from '../../../utils/slug';
import { getHttpErrorCode } from '../../../utils/http-error';
import { FakeDataButton } from '../../../shared/fake-data-button/fake-data-button';

interface QuestionariPayload {
  answers: Record<string, string>;
}

interface PlaAccionsPayload {
  impactes: Record<string, string>;
  dificultats: Record<string, string>;
  terminis: Record<string, string>;
}

interface Pregunta {
  id: string;
  text: string;
  respostes: string[];
  /** Accions recomanades per nivell assolit (1r, 2n, 3r); el 4t nivell no requereix acció */
  accions: string[];
}

interface Proces {
  proces: string;
  preguntes: Pregunta[];
}

interface Seccio {
  ambit: string;
  processos: Proces[];
}

const IMPACTE_OPTIONS = ['1 - Alt', '2 - Mig', '3 - Baix'];
const DIFICULTAT_OPTIONS = ['1 - Baixa', '2 - Mitja', '3 - Alta'];
const TERMINI_OPTIONS = [
  'Curt termini (0 – 6 Mesos)',
  'Mig termini (6 – 18 mesos)',
  'Llarg termini (18-36 mesos)',
  '<No aplica>',
];

@Component({
  selector: 'app-pla-accions',
  imports: [FormsModule, FakeDataButton],
  templateUrl: './pla-accions.html',
  styleUrl: './pla-accions.css',
})
export class PlaAccions implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private municipiActual = '';

  readonly impacteOptions = IMPACTE_OPTIONS;
  readonly dificultatOptions = DIFICULTAT_OPTIONS;
  readonly terminiOptions = TERMINI_OPTIONS;

  answers: Record<string, string> = {};
  impactes: Record<string, string> = {};
  dificultats: Record<string, string> = {};
  terminis: Record<string, string> = {};
  activeSeccio = '';

  constructor(
    private http: HttpClient,
    private municipiService: MunicipiService,
    private toast: ToastService,
  ) {
    this.activeSeccio = this.seccions[0]?.ambit ?? '';
  }

  ngOnInit(): void {
    this.municipiService.municipiSeleccionat$
      .pipe(
        takeUntil(this.destroy$),
        filter((municipi): municipi is string => !!municipi),
        switchMap((municipi) => {
          this.municipiActual = municipi;
          this.resetForm();
          const slug = toSlug(municipi);
          return forkJoin({
            questionari: this.http
              .get<Partial<QuestionariPayload>>(`${API_BASE}/api/data/municipis/${slug}/questionari`)
              .pipe(catchError(() => of<Partial<QuestionariPayload>>({}))),
            plaAccions: this.http
              .get<Partial<PlaAccionsPayload>>(`${API_BASE}/api/data/municipis/${slug}/pla-accions`)
              .pipe(catchError(() => of<Partial<PlaAccionsPayload>>({}))),
          });
        }),
      )
      .subscribe({
        next: ({ questionari, plaAccions }) => {
          this.answers = questionari.answers ?? {};
          this.impactes = plaAccions.impactes ?? {};
          this.dificultats = plaAccions.dificultats ?? {};
          this.terminis = plaAccions.terminis ?? {};
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveData(): void {
    if (!this.municipiActual) return;

    const payload: PlaAccionsPayload = {
      impactes: this.impactes,
      dificultats: this.dificultats,
      terminis: this.terminis,
    };
    this.http
      .post(`${API_BASE}/api/data/municipis/${toSlug(this.municipiActual)}/pla-accions`, payload)
      .subscribe({
        next: () => this.toast.success(),
        error: (error) => {
          console.error("Error saving Pla d'accions data", error);
          this.toast.error(`Error ${getHttpErrorCode(error)} al intentar guardar el dato`);
        },
      });
  }

  /** Omple Impacte, Dificultat i Termini objectiu amb valors aleatoris i desa immediatament */
  fillFakeData(): void {
    for (const seccio of this.seccions) {
      for (const proc of seccio.processos) {
        for (const pregunta of proc.preguntes) {
          this.impactes[pregunta.id] = this.randomOption(this.impacteOptions);
          this.dificultats[pregunta.id] = this.randomOption(this.dificultatOptions);
          this.terminis[pregunta.id] = this.randomOption(this.terminiOptions);
        }
      }
    }
    this.saveData();
  }

  private randomOption(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  private resetForm(): void {
    this.answers = {};
    this.impactes = {};
    this.dificultats = {};
    this.terminis = {};
  }

  /** Índex 0-based de la resposta real marcada al Qüestionari (null si encara no s'ha contestat) */
  respostaIndex(id: string): number | null {
    const raw = this.answers[id];
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isNaN(n) ? null : n - 1;
  }

  private readonly nivellBg = ['bg-error/10', 'bg-warning/10', 'bg-info/10', 'bg-success/10'];

  /** Classes CSS de la cel·la de nivell $index, amb destacat si coincideix amb la resposta real */
  nivellCellClass(preguntaId: string, index: number): string {
    const base = 'border-r border-base-300 whitespace-normal text-left text-xs ' + this.nivellBg[index];
    return this.respostaIndex(preguntaId) === index
      ? base + ' ring-2 ring-inset ring-primary font-semibold'
      : base;
  }

  /** Prioritat automàtica = nivell de maduresa assolit (1-3); buida si ja s'ha assolit el nivell 4 */
  prioritatAuto(id: string): number | '' {
    const idx = this.respostaIndex(id);
    if (idx === null || idx >= 3) return '';
    return idx + 1;
  }

  /** Pla d'acció automàtic ("{nivell} - {acció}") segons la resposta real; buit si ja assolit */
  plaAccioAuto(pregunta: Pregunta, id: string): string {
    const idx = this.respostaIndex(id);
    if (idx === null || idx >= 3) return '';
    return `${idx + 1} - ${pregunta.accions[idx]}`;
  }

  /** Suma dels nivells d'Impacte i Dificultat seleccionats (fórmula original de l'Excel) */
  impacteDificultat(id: string): number | '' {
    const i = parseInt(this.impactes[id], 10);
    const d = parseInt(this.dificultats[id], 10);
    if (Number.isNaN(i) || Number.isNaN(d)) return '';
    return i + d;
  }

  seccions: Seccio[] = [
    {
      ambit: 'Govern',
      processos: [
        {
          proces: "Establiment d'estàndards, polítiques, bones pràctiques i procediments",
          preguntes: [
            {
              id: 'GA01',
              text: 'Existeix un marc de Govern de la dada establert? (Polítiques, estàndards, procediments, inventari de dades, bones pràctiques, ...)',
              respostes: [
                'No, no existeix un marc de Govern de la dada establert',
                'Sí, però cada Àrea identifica i desenvolupa els seus processos amb el seu propi criteri',
                'Sí, hi ha un marc de Govern de la dada establert i publicat, que coneixen i utilitzen les diferents Àrees',
                'Sí, hi ha un marc de Govern de la dada establert i publicat, que coneixen i utilitzen les diferents Àrees, i que està subjecte a processos de millora continua de manera periòdica',
              ],
              accions: [
                "Definir un Marc de Govern de la dada de marea senzilla i escalable alineat amb els objectius de l'Ajuntament/Organisme, definint regles clares de gestió de les dades (qualitat, seguretat i accés), rols i responsabilitats i processos clau)",
                'Establir un marc de Govern del Dada unificat per garantir coherència i alineació entre àrees fent un treball de centralització de la governança i unificació de criteris.',
                'Assegurar la aplicació del Marc de Govern de la dada de manera efectiva, avaluant el compliment i efectivitat, i executant processos de millora contínua',
                '',
              ],
            },
            {
              id: 'GA02',
              text: "Estan documentades les Polítiques de Govern de la dada i aquestes estan orientades a optimitzar el valor de les dades? (estan publicades, el personal les coneix, s'actualitzen periòdicament, i es mesura i monitoritza el compliment)",
              respostes: [
                'No, no hi ha polítiques per a la optimització del valor de les dades',
                "Sí, hi ha algunes polítiques, però no s'implementen adequadament",
                "Sí, hi ha polítiques per a la optimització del valor de les dades i s'implementen adequadament",
                "Sí, hi ha polítiques per a la optimització del valor de les dades, s'implementen adequadament, i es porten a terme accions periòdiques de millora continua",
              ],
              accions: [
                "Cal definir la Política de Govern de la dada, es pot iniciar amb regles bàsiques que defineixin les responsabilitats, classifiquin les dades, estableixin normes d'accés i seguretat, i projectar un Inventari de dades. Per tal de fer aquest camí més senzill i aprofitant l'experiència de la DIBA, aquesta facilita el procediment d'adhesió a les seves Polítiques.",
                "Cal revisar que les Polítiques definides son aplicables, si es poden simplificar i assegurar un lideratge en l'àmbit del Govern de la dada. Addicionalment, seria positiu reforçar la comunicació, assegurar la capacitació dels implicats i portar a terme accions que facin que el Govern de la dada s'integri a la operació diària.",
                "És recomanable revisar les Polítiques periòdicament per tal d'optimitzar-les i assegurar que s'adapten a les noves necessitats.",
                '',
              ],
            },
          ],
        },
        {
          proces: "Establiment d'estratègies de dades",
          preguntes: [
            {
              id: 'GB01',
              text: "Existeix una estratègia de dades que inclogui iniciatives, objectius i fites, i aquesta es coneguda per l'Ajuntament/Organisme?",
              respostes: [
                'No, no hi ha una estratègia de dades coneguda',
                'Sí, existeix una estratègia de dades però no és molt coneguda o no defineix clarament les iniciatives, objectius o fites',
                "Sí, existeix una estratègia de dades coneguda que inclou el detall d'iniciatives, objectius i fites",
                "Sí, existeix una estratègia de dades coneguda que inclou el detall d'iniciatives, objectius i fites, i es fa un seguiment periòdic del compliment",
              ],
              accions: [
                "Definir una estratègia de dades de manera clara i accessible per a tots els actors implicats, que detalli els objectius estratègics, concreti iniciatives/un pla d'acció amb prioritats i involucrar als equips de treball",
                "Revisar l'estratègia de dades per concretar iniciatives, objectius mesurables i fites clares, i assegurar que tots els equips implicats la coneguin i facin seva",
                "Assegurar el compliment de l'estratègia de dades fent un seguiment regular de les iniciatives, revisant els objectius i les fites i fomentant la millora continua",
                '',
              ],
            },
            {
              id: 'GB02',
              text: "Hi ha mètriques d'utilització i rendiment de les dades?",
              respostes: [
                "No, no hi ha mètriques d'utilització i rendiment de les dades",
                "Sí, per a alguna àrea hi ha alguna mètrica d'utilització i rendiment, però no es fa un seguiment",
                "Sí, hi ha mètriques d'utilització i rendiment a les àrees, es fa un seguiment i utilització d'aquestes dades",
                "Sí, hi ha mètriques d'utilització i rendiment a les àrees, es fa un seguiment i utilització d'aquestes dades, i periòdicament es revisen (definició, necessitat, llindars, etc.) per tal de garantir una millora continua",
              ],
              accions: [
                'Cal establir indicadors clau (KPIs) per a mesurar la qualitat, accessibilitat i efectivitat de les dades. Aquestes mètriques haurien de mesurar qualitats com la precisió, integritat, consistència i rendiment de les dades. Això facilitarà la gestió i millora de les dades.',
                "Es recomana fer un monitoreig de les mètriques d'ús i rendiment per a analitzar les mètriques de manera periòdica, i estendre l'activitat a les principals àrees de l'Ajuntament o Organització. Fer el seguiment d'aquestes mètriques ajudarà a identificar possibles millores.",
                "Es recomana optimitzar els processos d'anàlisi per tal d'identificar tendències i punts de millora de manera proactiva, i fer revisions periòdiques per alinear les mètriques amb els objectius estratègics (p.e. el PAM de l'Ajuntament).",
                '',
              ],
            },
          ],
        },
        {
          proces: "Establiment d'estructures organitzacionals",
          preguntes: [
            {
              id: 'GC01',
              text: 'Existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades?',
              respostes: [
                'No existeix una estructura organitzativa formal per al Govern de la dada ni es porten a terme comitès de dades',
                'Sí, existeix una estructura organitzativa formal per al Govern de la dada, però no es porten a terme comitès de dades de manera regular',
                'Sí, existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades de manera regular',
                'Sí, existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades de manera regular amb un alt grau de col·laboració entre les diferents àrees',
              ],
              accions: [
                'Crear una estructura organitzativa mínima viable que permeti iniciar la governança de manera efectiva, definint rols clau, com Responsable de dades i Propietari de dades, i establir un Comitè de Dades per a la coordinació entre àrees',
                'Establir reunions del comitè de dades amb la periodicitat que sigui necessari per fer seguiment de la governança de les dades',
                "Assegurar que les decisions i accions derivades dels comitès estan alineats amb l'estratègia, avaluar i optimitzar els resultats dels Comitès",
                '',
              ],
            },
          ],
        },
        {
          proces: 'Gestió de recursos humans',
          preguntes: [
            {
              id: 'GD01',
              text: 'Estan definits els rols i responsabilitats per al Govern de la dada (al menys Responsable de les dades i Propietari de les dades)?',
              respostes: [
                'No, no estan definits els rols i responsabilitats adequadament',
                'Sí, estan definits els rols i responsabilitats, però no estan assignats a personal qualificat',
                'Sí, estan definits els rols i responsabilitats, i estan assignats a personal qualificat',
                'Sí, estan definits els rols i responsabilitats, es revisen periòdicament i es forma al personal assignat per a garantir una millora continua',
              ],
              accions: [
                'És fonamental assignar definir i assignar els rols de Propietari de la dada (Data Owners) i de Responsable de la dada (Data Steward) per a garantitzar la qualitat, seguretat i us adequat de la informació. La definició d\'aquests rols ha de deixar clares les funcions i les responsabilitats.',
                "Cal identificar a les persones adequades dins de l'Ajuntament o Organisme i formalitzar l'assignació de rols, comunicar clarament les responsabilitats, capacitar-los i fer seguiment de les seves funcions.",
                "Cal considerar establir mètriques d'ús i rendiment, assegurar que s'utilitzen a la presa de decisions, i implantar processos de millora contínua.",
                '',
              ],
            },
            {
              id: 'GD02',
              text: 'Està definit i assignat el rol de Responsable de les dades?',
              respostes: [
                'No, no està definit clarament aquest rol i no hi ha personal assignat',
                'Sí, està definit i assignat però, el personal no coneix clarament les seves funcions',
                'Sí, està definit i assignat, i el personal coneix clarament les seves funcions',
                'Sí, està definit i assignat i el personal coneix clarament les seves funcions i es fan accions periòdiques per tal de garantir una millora continua',
              ],
              accions: [
                "S'hauria de definir clarament les funcions del Responsable de dades (Data Stewart), identificar els perfils adequats dins de l'Ajuntament o Organisme i capacitar-los per a portar a terme les seves funcions de manera efectiva.",
                "Cal capacitar al Responsable de dades (Data Stewart) i comunicar clarament les seves funcions dins l'Ajuntament o Organisme per a que pugui desenvolupar les seves funcions de manera efectiva.",
                'És recomanable establir mètriques, optimitzar processos contínuament i fomentar la col·laboració entre els diferents rols per enfortir la governança de dades.',
                '',
              ],
            },
            {
              id: 'GD03',
              text: 'Està identificat i es coneix el propietari de les dades de cada Àrea?',
              respostes: [
                'No, no està definit clarament aquest rol i no hi ha personal assignat',
                'Sí, està definit i assignat però, el personal no coneix les seves funcions, o hi ha alguna àrea per a les que no hi ha personal assignat',
                'Sí, està definit i assignat, i el personal a cada àrea coneix clarament les seves funcions',
                "Sí, està definit i assignat, el personal a cada àrea coneix clarament les seves funcions, i es fan accions periòdiques per tal de garantir una millora",
              ],
              accions: [
                'És important definir el rol de Propietari de dades (Data Owner) i assignar-lo a persones amb gran coneixement funcional i responsabilitat sobre les dades. El Responsable de dades ha de ser responsable de la qualitat, seguretat i accés a les dades, i tenir l\'autoritat per a la presa de decisions i garantir que les dades es gestionen adequadament.',
                "Cal comunicar l'existència del rol de Propietari de dades, el personal que té assignat i les responsabilitats de manera clara dins l'Ajuntament o Organisme.",
                "És interessant garantir l'autoritat i visibilitat dels Propietaris de dades, assegurant que tingui els recursos i que s'implementen activitats de millora contínua.",
                '',
              ],
            },
          ],
        },
      ],
    },
    {
      ambit: 'Gestió de dades',
      processos: [
        {
          proces: 'Gestió de seguretat de dades',
          preguntes: [
            {
              id: 'MA01',
              text: "Existeixen Polítiques de seguretat i privadesa de les dades alineades amb les regulacions vigents s'avalua el seu compliment?",
              respostes: [
                'No, no hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents',
                "Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents però no son conegudes pel personal i/o no s'avalua el seu compliment",
                'Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents que son conegudes pel personal, i es fan revisions del seu compliment',
                "Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents que son conegudes pel personal, i es fan revisions del seu compliment. Addicionalment es fan revisions d'aquestes per tal d'assegurar l'alineament amb noves regulacions i per optimitzar els processos",
              ],
              accions: [
                "Definir les Polítiques de seguretat i privadesa alineades amb les regulacions vigents. Per tal de fer aquest camí més senzill i aprofitant l'experiència de la DIBA, aquesta facilita el procediment d'adhesió a les seves Polítiques.",
                'Divulgar les Polítiques de seguretat i privadesa entre el personal per tal que aquestes siguin conegudes, i fer avaluacions periòdiques del seu compliment',
                "Fer revisions periòdiques de les Polítiques per tal d'assegurar que aquestes es mantenen actualitzades amb les regulacions vigents i cercar oportunitats de millora continua",
                '',
              ],
            },
            {
              id: 'MA02',
              text: "Les dades s'identifiquen i classifiquen en nivells de sensibilitat en funció de l'àmbit d'actuació dins de l'Ajuntament/Organisme?",
              respostes: [
                'No, no es classifiquen les dades en funció de la seva sensibilitat',
                'Sí, algunes dades es classifiquen en funció de la seva sensibilitat i/o el personal no coneix aquesta classificació',
                "Sí, les dades es classifiquen en funció de la seva sensibilitat i el personal coneix i utilitza les dades d'acord a aquesta classificació",
                "Sí, les dades es classifiquen en funció de la seva sensibilitat i el personal coneix i utilitza les dades d'acord a aquesta classificació, i es fan auditories periòdiques per tal de detectar possibles errors i fer millora continua",
              ],
              accions: [
                'Identificar i classificar les dades clau en funció de la seva sensibilitat',
                "Assegurar que estan identificades i classificades totes les dades clau en funció de la seva sensibilitat i que el personal utilitza les dades d'acord a aquesta classificació",
                'Es recomana establir auditories que ajudin a detectar errors i definir accions de millora continua',
                '',
              ],
            },
          ],
        },
        {
          proces: 'Gestió de dades històriques',
          preguntes: [
            {
              id: 'MB01',
              text: "Existeixen Polítiques d'arxivat i restauració de dades?",
              respostes: [
                "No, no hi ha Polítiques d'arxivat i restauració de dades",
                "Sí, hi ha Polítiques d'arxivat i restauració de dades, però no s'apliquen adequadament",
                "Sí, hi ha Polítiques d'arxivat i restauració de dades que s'apliquen adequadament",
                "Sí, hi ha Polítiques d'arxivat i restauració de dades que s'apliquen adequadament i son revisades de forma periòdica per tal de millorar-les",
              ],
              accions: [
                "Definir les Polítiques d'arxivat i restauració de dades. Per tal de fer aquest camí més senzill i aprofitant l'experiència de la DIBA, aquesta facilita el procediment d'adhesió a les seves Polítiques.",
                "Revisar i implicar al personal en l'aplicació de les Polítiques d'arxivat i restauració de dades",
                "Portar a terme accions de millora continua de les Polítiques d'arxivat i restauració de dades",
                '',
              ],
            },
          ],
        },
        {
          proces: 'Gestió de fonts i destinacions de dades',
          preguntes: [
            {
              id: 'MC01',
              text: "Existeix un Inventari de dades, que inclou conjunts de dades, dades mestre de referència, i metadades, i on s'identifiquen les fonts de dades de l'Ajuntament/Organisme que és compartit i conegut pel personal?",
              respostes: [
                'No, no existeix un Catàleg de dades ni Inventari de dades',
                "Sí, existeix el Catàleg de dades i l'Inventari de dades, però aquest no és complet i/o el seu us és bastant limitat",
                "Sí, existeix el Catàleg de dades i l'Inventari de dades, on s'identifiquen les fonts de dades de l'Ajuntament/Organisme, les dades clau, son coneguts i utilitzats de manera regular",
                "Sí, existeix el Catàleg de dades i l'Inventari de dades, on s'identifiquen les fonts de dades de l'Ajuntament/Organisme, les dades clau, son coneguts i utilitzats de manera regular, i regularment es revisa per tal de fer millora continua i avaluar el seu us",
              ],
              accions: [
                "Iniciar les tasques d'implementació de l'Inventari de dades",
                "Ampliar l'Inventari de dades a totes les dades clau, i difondre i promoure la seva utilització",
                "Fer revisions periòdiques de l'Inventari de dades per tal d'assegurar que aquest es manté actualitzat i cercar oportunitats de millora continua",
                '',
              ],
            },
            {
              id: 'MC02',
              text: 'Estan identificades les dades i fonts de dades externes i aquestes es gestionen mitjançant acords formals i s\'estableixen controls de qualitat específics?',
              respostes: [
                'No, no estan identificades les dades ni fonts de dades externes',
                'Sí, estan identificades les dades i les fonts de dades externes però no hi ha una gestió específica sobre aquestes',
                "Sí, estan identificades les dades i les fonts de dades externes i es fa una gestió específica sobre aquestes per tal d'assegurar que son de qualitat i segures",
                "Sí, estan identificades les dades i les fonts de dades externes i es fa una gestió específica sobre aquestes per tal d'assegurar que son de qualitat i segures, i es fan avaluacions periòdiques per tal de trobar punts de millora continua",
              ],
              accions: [
                'Identificar les fonts de dades externes i les dades associades per tal de poder fer una gestió específica d\'aquestes',
                'Fer una gestió específica sobre les fonts de dades i dades externes per tal d\'assegurar que son de qualitat i segures',
                'Establir mecanismes de millora continua als processos de gestió de dades i fonts de dades externes',
                '',
              ],
            },
          ],
        },
        {
          proces: 'Gestió de la integració de les dades',
          preguntes: [
            {
              id: 'MD01',
              text: 'Existeixen Polítiques i procediments d\'integració, gestió i utilització de les dades?',
              respostes: [
                "No, no hi ha Polítiques ni procediments d'integració, gestió ni utilització de les dades",
                "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, però no s'apliquen adequadament",
                "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, que s'apliquen adequadament",
                "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, que s'apliquen adequadament, que son avaluats periòdicament per tal de trobar punts de millora",
              ],
              accions: [
                "Definir les Polítiques i procediments d'integració, gestió i utilització de les dades. Per tal de fer aquest camí més senzill i aprofitant l'experiència de la DIBA, aquesta facilita el procediment d'adhesió a les seves Polítiques.",
                "Revisar i implicar al personal en l'aplicació de les Polítiques i procediments d'integració, gestió i utilització de les dades",
                "Portar a terme accions de millora continua de les Polítiques i procediments d'integració, gestió i utilització de les dades",
                '',
              ],
            },
          ],
        },
        {
          proces: 'Gestió de Dades Mestre i Dades de Referència',
          preguntes: [
            {
              id: 'ME01',
              text: "Estan identificades les Dades Mestre i les Dades de Referència?\nDades Mestre son les dades que representen la informació fonamental per a l'Ajuntament/Organisme (p.e. nom, cognoms, tributs, empleats, etc.)\nDades de Referència son les dades que s'utilitzen como referència o estàndard per a contextualitzar",
              respostes: [
                'No, no estan identificades les Dades Mestre ni les Dades de Referència',
                'Sí, hi ha identificades Dades Mestre i les Dades de Referència, però la identificació no és completa',
                "Sí, hi ha identificades totes les Dades Mestre i les Dades de Referència clau per a l'Ajuntament/Organisme",
                "Sí, hi ha identificades totes les Dades Mestre i les Dades de Referència clau per a l'Ajuntament/Organisme, i periòdicament es revisen les definicions d'aquestes, la completitud i es porten a terme tasques de millora continua",
              ],
              accions: [
                "Definir les Polítiques i procediments d'integració, gestió i utilització de les dades. Per tal de fer aquest camí més senzill i aprofitant l'experiència de la DIBA, aquesta facilita el procediment d'adhesió a les seves Polítiques.",
                "Revisar i implicar al personal en l'aplicació de les Polítiques i procediments d'integració, gestió i utilització de les dades",
                "Portar a terme accions de millora continua de les Polítiques i procediments d'integració, gestió i utilització de les dades",
                '',
              ],
            },
          ],
        },
      ],
    },
    {
      ambit: 'Qualitat de la dada',
      processos: [
        {
          proces: "Establiment d'estàndards, polítiques, bones pràctiques i procediments",
          preguntes: [
            {
              id: 'QA01',
              text: 'Estan documentats els requeriments de qualitat de les dades (precisió, integritat, consistència, completitud, puntualitat, etc.)?',
              respostes: [
                'No, no estan documentats els requeriments de qualitat de les dades',
                "Sí, estan documentats alguns requeriments de qualitat d'algunes dades",
                'Sí, estan documentats els requeriments de qualitat de les dades i hi ha processos automàtics orientats a garantir la qualitat de les dades',
                "Sí, estan documentats els requeriments de qualitat de les dades i hi ha processos automàtics orientats a garantir la qualitat de les dades, i aquests es revisen de manera regular per tal d'identificar i aplicar millores",
              ],
              accions: [
                'Iniciar la documentació dels requeriments de qualitat de les dades, prioritzant les dades clau i crítiques',
                "Completar la documentació de requeriments de qualitat de les dades i valorar l'automatització de processos que ajudin a garantir la qualitat de les dades",
                "Maximitzar l'automatització de processos que ajudin a garantir la qualitat de les dades i establir mecanismes de millora continua",
                '',
              ],
            },
          ],
        },
        {
          proces: 'Control i monitorització de la qualitat de les dades',
          preguntes: [
            {
              id: 'QB01',
              text: 'Es fa un seguiment actiu i monitoratge de la qualitat de les dades?',
              respostes: [
                'No, no es fa un seguiment actiu ni es monitoritza la qualitat de les dades',
                "Sí, es fan seguiments i monitorització de la qualitat de les dades de manera esporàdica únicament quan es detecten errors, i s'estableixen mesures correctives",
                'Sí, es fan seguiments i monitorització de la qualitat de les dades de manera regular i planificada, per implantar mesures correctives i preventives',
                "Sí, es fan seguiments i monitorització de la qualitat de les dades de manera regular i planificada, per implantar mesures correctives i preventives, i s'avaluen els propis criteris de seguiment i monitorització per tal d'optimitzar-los",
              ],
              accions: [
                'Començar a fer seguiment actiu i monitorització de la qualitat de les dades',
                "Periodificar i ampliar l'abast del seguiment i monitorització de la qualitat de les dades per tal que doni suport a la implantació accions orientades a la prevenció",
                "Implantar revisions periòdiques d'avaluació dels propis criteris de seguiment i monitorització de la qualitat per tal d'optimitzar-los",
                '',
              ],
            },
          ],
        },
        {
          proces: 'Planificació de la qualitat de les dades',
          preguntes: [
            {
              id: 'QC01',
              text: "Existeix una planificació de les activitats d'assegurament de la qualitat de les dades que detalla els objectius de qualitat, planifica el seguiment i monitorització de la qualitat de les dades, etc.?",
              respostes: [
                "No, no es planifiquen les activitats d'assegurament de la qualitat de les dades",
                "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, però aquesta planificació no detalla els objectius de qualitat o les activitats de seguiment i monitorització de la qualitat",
                "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, detallant els objectius de qualitat i les activitats de seguiment i monitorització de la qualitat",
                "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, detallant els objectius de qualitat i les activitats de seguiment i monitorització de la qualitat, i es fan activitats de millora continua des de les pròpies activitats de planificació",
              ],
              accions: [
                "Preparar un pla d'assegurament de la qualitat de les dades, que inicialment posi el focus en les dades crítiques i dades clau",
                "Ampliar el detall del pla d'assegurament de la qualitat de les dades, assegurant que aquest detalla els objectius de qualitat, i les activitats de seguiment i monitorització",
                "Incorporar avaluacions de millora continua per al propi procés de planificació de la qualitat de les dades.",
                '',
              ],
            },
          ],
        },
      ],
    },
  ];
}
