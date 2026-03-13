import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-questionari',
  imports: [FormsModule],
  templateUrl: './form-questionari.html',
  styleUrl: './form-questionari.css',
})
export class FormQuestionari {
  answers: Record<string, string> = {};
  observacions: Record<string, string> = {};
  evidencies: Record<string, string> = {};

  seccions = [
    {
      ambit: 'Govern',
      processos: [
        {
          proces: "Establiment d'estàndards, polítiques, bones pràctiques i procediments",
          preguntes: [
            { id: 'GA01', text: 'Existeix un marc de Govern de la dada establert? (Polítiques, estàndards, procediments, inventari de dades, bones pràctiques, ...)', respostes: [
              'No, no existeix un marc de Govern de la dada establert',
              'Sí, però cada Àrea identifica i desenvolupa els seus processos amb el seu propi criteri',
              'Sí, hi ha un marc de Govern de la dada establert i publicat, que coneixen i utilitzen les diferents Àrees',
              'Sí, hi ha un marc de Govern de la dada establert i publicat, que coneixen i utilitzen les diferents Àrees, i que està subjecte a processos de millora continua de manera periòdica',
            ]},
            { id: 'GA02', text: "Estan documentades les Polítiques de Govern de la dada i aquestes estan orientades a optimitzar el valor de les dades? (estan publicades, el personal les coneix, s'actualitzen periòdicament, i es mesura i monitoritza el compliment)", respostes: [
              'No, no hi ha polítiques per a la optimització del valor de les dades',
              "Sí, hi ha algunes polítiques, però no s'implementen adequadament",
              "Sí, hi ha polítiques per a la optimització del valor de les dades i s'implementen adequadament",
              "Sí, hi ha polítiques per a la optimització del valor de les dades, s'implementen adequadament, i es porten a terme accions periòdiques de millora continua",
            ]},
          ]
        },
        {
          proces: "Establiment d'estratègies de dades",
          preguntes: [
            { id: 'GB01', text: "Existeix una estratègia de dades que inclogui iniciatives, objectius i fites, i aquesta es coneguda per l'Ajuntament/Organisme?", respostes: [
              'No, no hi ha una estratègia de dades coneguda',
              "Sí, existeix una estratègia de dades però no és molt coneguda o no defineix clarament les iniciatives, objectius o fites",
              "Sí, existeix una estratègia de dades coneguda que inclou el detall d'iniciatives, objectius i fites",
              "Sí, existeix una estratègia de dades coneguda que inclou el detall d'iniciatives, objectius i fites, i es fa un seguiment periòdic del compliment",
            ]},
            { id: 'GB02', text: "Hi ha mètriques d'utilització i rendiment de les dades?", respostes: [
              "No, no hi ha mètriques d'utilització i rendiment de les dades",
              "Sí, per a alguna àrea hi ha alguna mètrica d'utilització i rendiment, però no es fa un seguiment",
              "Sí, hi ha mètriques d'utilització i rendiment a les àrees, es fa un seguiment i utilització d'aquestes dades",
              "Sí, hi ha mètriques d'utilització i rendiment a les àrees, es fa un seguiment i utilització d'aquestes dades, i periòdicament es revisen (definició, necessitat, llindars, etc.) per tal de garantir una millora continua",
            ]},
          ]
        },
        {
          proces: "Establiment d'estructures organitzacionals",
          preguntes: [
            { id: 'GC01', text: "Existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades?", respostes: [
              'No existeix una estructura organitzativa formal per al Govern de la dada ni es porten a terme comitès de dades',
              "Sí, existeix una estructura organitzativa formal per al Govern de la dada, però no es porten a terme comitès de dades de manera regular",
              "Sí, existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades de manera regular",
              "Sí, existeix una estructura organitzativa formal per al Govern de la dada i es porten a terme comitès de dades de manera regular amb un alt grau de col·laboració entre les diferents àrees",
            ]},
          ]
        },
        {
          proces: 'Gestió de recursos humans',
          preguntes: [
            { id: 'GD01', text: "Estan definits els rols i responsabilitats per al Govern de la dada (al menys Responsable de les dades i Propietari de les dades)?", respostes: [
              'No, no estan definits els rols i responsabilitats adequadament',
              'Sí, estan definits els rols i responsabilitats, però no estan assignats a personal qualificat',
              'Sí, estan definits els rols i responsabilitats, i estan assignats a personal qualificat',
              'Sí, estan definits els rols i responsabilitats, es revisen periòdicament i es forma al personal assignat per a garantir una millora continua',
            ]},
            { id: 'GD02', text: "Està definit i assignat el rol de Responsable de les dades?", respostes: [
              'No, no està definit clarament aquest rol i no hi ha personal assignat',
              'Sí, està definit i assignat però, el personal no coneix clarament les seves funcions',
              'Sí, està definit i assignat, i el personal coneix clarament les seves funcions',
              'Sí, està definit i assignat i el personal coneix clarament les seves funcions i es fan accions periòdiques per tal de garantir una millora continua',
            ]},
            { id: 'GD03', text: "Està identificat i es coneix el propietari de les dades de cada Àrea?", respostes: [
              'No, no està definit clarament aquest rol i no hi ha personal assignat',
              'Sí, està definit i assignat però, el personal no coneix les seves funcions, o hi ha alguna àrea per a les que no hi ha personal assignat',
              'Sí, està definit i assignat, i el personal a cada àrea coneix clarament les seves funcions',
              "Sí, està definit i assignat, el personal a cada àrea coneix clarament les seves funcions, i es fan accions periòdiques per tal de garantir una millora",
            ]},
          ]
        },
      ]
    },
    {
      ambit: 'Gestió de dades',
      processos: [
        {
          proces: 'Gestió de seguretat de dades',
          preguntes: [
            { id: 'MA01', text: "Existeixen Polítiques de seguretat i privadesa de les dades alineades amb les regulacions vigents s'avalua el seu compliment?", respostes: [
              'No, no hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents',
              "Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents però no son conegudes pel personal i/o no s'avalua el seu compliment",
              'Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents que son conegudes pel personal, i es fan revisions del seu compliment',
              "Sí, hi ha Polítiques de seguretat i privadesa alineades amb les regulacions vigents que son conegudes pel personal, i es fan revisions del seu compliment. Addicionalment es fan revisions d'aquestes per tal d'assegurar l'alineament amb noves regulacions i per optimitzar els processos",
            ]},
            { id: 'MA02', text: "Les dades s'identifiquen i classifiquen en nivells de sensibilitat en funció de l'àmbit d'actuació dins de l'Ajuntament/Organisme?", respostes: [
              'No, no es classifiquen les dades en funció de la seva sensibilitat',
              'Sí, algunes dades es classifiquen en funció de la seva sensibilitat i/o el personal no coneix aquesta classificació',
              "Sí, les dades es classifiquen en funció de la seva sensibilitat i el personal coneix i utilitza les dades d'acord a aquesta classificació",
              "Sí, les dades es classifiquen en funció de la seva sensibilitat i el personal coneix i utilitza les dades d'acord a aquesta classificació, i es fan auditories periòdiques per tal de detectar possibles errors i fer millora continua",
            ]},
          ]
        },
        {
          proces: 'Gestió de dades històriques',
          preguntes: [
            { id: 'MB01', text: "Existeixen Polítiques d'arxivat i restauració de dades?", respostes: [
              "No, no hi ha Polítiques d'arxivat i restauració de dades",
              "Sí, hi ha Polítiques d'arxivat i restauració de dades, però no s'apliquen adequadament",
              "Sí, hi ha Polítiques d'arxivat i restauració de dades que s'apliquen adequadament",
              "Sí, hi ha Polítiques d'arxivat i restauració de dades que s'apliquen adequadament i son revisades de forma periòdica per tal de millorar-les",
            ]},
          ]
        },
        {
          proces: 'Gestió de fonts i destinacions de dades',
          preguntes: [
            { id: 'MC01', text: "Existeix un Inventari de dades, que inclou conjunts de dades, dades mestre de referència, i metadades, i on s'identifiquen les fonts de dades de l'Ajuntament/Organisme que és compartit i conegut pel personal?", respostes: [
              'No, no existeix un Catàleg de dades ni Inventari de dades',
              "Sí, existeix el Catàleg de dades i l'Inventari de dades, però aquest no és complet i/o el seu us és bastant limitat",
              "Sí, existeix el Catàleg de dades i l'Inventari de dades, on s'identifiquen les fonts de dades de l'Ajuntament/Organisme, les dades clau, son coneguts i utilitzats de manera regular",
              "Sí, existeix el Catàleg de dades i l'Inventari de dades, on s'identifiquen les fonts de dades de l'Ajuntament/Organisme, les dades clau, son coneguts i utilitzats de manera regular, i regularment es revisa per tal de fer millora continua i avaluar el seu us",
            ]},
            { id: 'MC02', text: "Estan identificades les dades i fonts de dades externes i aquestes es gestionen mitjançant acords formals i s'estableixen controls de qualitat específics?", respostes: [
              'No, no estan identificades les dades ni fonts de dades externes',
              'Sí, estan identificades les dades i les fonts de dades externes però no hi ha una gestió específica sobre aquestes',
              "Sí, estan identificades les dades i les fonts de dades externes i es fa una gestió específica sobre aquestes per tal d'assegurar que son de qualitat i segures",
              "Sí, estan identificades les dades i les fonts de dades externes i es fa una gestió específica sobre aquestes per tal d'assegurar que son de qualitat i segures, i es fan avaluacions periòdiques per tal de trobar punts de millora continua",
            ]},
          ]
        },
        {
          proces: 'Gestió de la integració de les dades',
          preguntes: [
            { id: 'MD01', text: "Existeixen Polítiques i procediments d'integració, gestió i utilització de les dades?", respostes: [
              "No, no hi ha Polítiques ni procediments d'integració, gestió ni utilització de les dades",
              "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, però no s'apliquen adequadament",
              "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, que s'apliquen adequadament",
              "Sí, hi ha Polítiques i procediments d'integració, gestió i utilització de les dades, que s'apliquen adequadament, que son avaluats periòdicament per tal de trobar punts de millora",
            ]},
          ]
        },
        {
          proces: 'Gestió de Dades Mestre i Dades de Referència',
          preguntes: [
            { id: 'ME01', text: "Estan identificades les Dades Mestre i les Dades de Referència?\nDades Mestre son les dades que representen la informació fonamental per a l'Ajuntament/Organisme (p.e. nom, cognoms, tributs, empleats, etc.)\nDades de Referència son les dades que s'utilitzen como referència o estàndard per a contextualitzar", respostes: [
              'No, no estan identificades les Dades Mestre ni les Dades de Referència',
              'Sí, hi ha identificades Dades Mestre i les Dades de Referència, però la identificació no és completa',
              "Sí, hi ha identificades totes les Dades Mestre i les Dades de Referència clau per a l'Ajuntament/Organisme",
              "Sí, hi ha identificades totes les Dades Mestre i les Dades de Referència clau per a l'Ajuntament/Organisme, i periòdicament es revisen les definicions d'aquestes, la completitud i es porten a terme tasques de millora continua",
            ]},
          ]
        },
      ]
    },
    {
      ambit: 'Qualitat de la dada',
      processos: [
        {
          proces: "Establiment d'estàndards, polítiques, bones pràctiques i procediments",
          preguntes: [
            { id: 'QA01', text: "Estan documentats els requeriments de qualitat de les dades (precisió, integritat, consistència, completitud, puntualitat, etc.)?", respostes: [
              'No, no estan documentats els requeriments de qualitat de les dades',
              "Sí, estan documentats alguns requeriments de qualitat d'algunes dades",
              'Sí, estan documentats els requeriments de qualitat de les dades i hi ha processos automàtics orientats a garantir la qualitat de les dades',
              "Sí, estan documentats els requeriments de qualitat de les dades i hi ha processos automàtics orientats a garantir la qualitat de les dades, i aquests es revisen de manera regular per tal d'identificar i aplicar millores",
            ]},
          ]
        },
        {
          proces: 'Control i monitorització de la qualitat de les dades',
          preguntes: [
            { id: 'QB01', text: 'Es fa un seguiment actiu i monitoratge de la qualitat de les dades?', respostes: [
              'No, no es fa un seguiment actiu ni es monitoritza la qualitat de les dades',
              "Sí, es fan seguiments i monitorització de la qualitat de les dades de manera esporàdica únicament quan es detecten errors, i s'estableixen mesures correctives",
              'Sí, es fan seguiments i monitorització de la qualitat de les dades de manera regular i planificada, per implantar mesures correctives i preventives',
              "Sí, es fan seguiments i monitorització de la qualitat de les dades de manera regular i planificada, per implantar mesures correctives i preventives, i s'avaluen els propis criteris de seguiment i monitorització per tal d'optimitzar-los",
            ]},
          ]
        },
        {
          proces: 'Planificació de la qualitat de les dades',
          preguntes: [
            { id: 'QC01', text: "Existeix una planificació de les activitats d'assegurament de la qualitat de les dades que detalla els objectius de qualitat, planifica el seguiment i monitorització de la qualitat de les dades, etc.?", respostes: [
              "No, no es planifiquen les activitats d'assegurament de la qualitat de les dades",
              "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, però aquesta planificació no detalla els objectius de qualitat o les activitats de seguiment i monitorització de la qualitat",
              "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, detallant els objectius de qualitat i les activitats de seguiment i monitorització de la qualitat",
              "Sí, es planifiquen les activitats d'assegurament de la qualitat de les dades, detallant els objectius de qualitat i les activitats de seguiment i monitorització de la qualitat, i es fan activitats de millora continua des de les pròpies activitats de planificació",
            ]},
          ]
        },
      ]
    },
  ];
}
