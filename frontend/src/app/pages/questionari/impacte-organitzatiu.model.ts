export interface ImpacteAction {
  key: string;
  excelRow: number;
  ambit: string;
  proces: string;
  codi: string;
  pregunta: string;
  accio: string;
}

export interface ImpacteProcesResultat {
  nom: string;
  puntuacio: number;
}

export interface ImpacteAmbitResultat {
  nom: string;
  processos: ImpacteProcesResultat[];
  puntuacio: number;
  procesLabels: string[];
  procesScores: number[];
}

export const IMPACTE_NIVELLS = [
  'No iniciada: no hi ha cap actuació definida ni implantada',
  'Inicial: l’actuació està planificada o implantada de manera parcial',
  'Implantada: l’actuació s’aplica de manera generalitzada',
  'Consolidada: l’actuació es mesura, es revisa i millora contínuament',
] as const;

const ACTION_ROWS: Array<Omit<ImpacteAction, 'key' | 'pregunta'>> = [
  { excelRow: 8, ambit: 'Persones', proces: 'Cultura i Sensibilització', codi: 'GA01', accio: "Sensibilitzar l’organització en la cultura de l’orientació a la dada" },
  { excelRow: 9, ambit: 'Persones', proces: 'Cultura i Sensibilització', codi: 'GA02', accio: 'Divulgar les polítiques de dades' },
  { excelRow: 10, ambit: 'Persones', proces: 'Cultura i Sensibilització', codi: 'GA03', accio: 'Implicar direcció i comandaments' },
  { excelRow: 12, ambit: 'Persones', proces: 'Formació i capacitació', codi: 'GB01', accio: 'Formar el personal en el govern de la dada' },
  { excelRow: 13, ambit: 'Persones', proces: 'Formació i capacitació', codi: 'GB02', accio: 'Formar en la qualitat de la dada' },
  { excelRow: 14, ambit: 'Persones', proces: 'Formació i capacitació', codi: 'GB03', accio: 'Formar en seguretat i privadesa' },
  { excelRow: 15, ambit: 'Persones', proces: 'Formació i capacitació', codi: 'GB04', accio: 'Capacitar equips en gestió de dades històriques' },
  { excelRow: 16, ambit: 'Persones', proces: 'Formació i capacitació', codi: 'GB05', accio: 'Formar en interpretació de KPIs i dashboards' },
  { excelRow: 18, ambit: 'Persones', proces: 'Rols i responsabilitats', codi: 'GC01', accio: 'Definir i assignar Data Owner' },
  { excelRow: 19, ambit: 'Persones', proces: 'Rols i responsabilitats', codi: 'GC02', accio: 'Definir i assignar Data Steward' },
  { excelRow: 20, ambit: 'Persones', proces: 'Rols i responsabilitats', codi: 'GC03', accio: 'Assignar responsable de KPIs' },
  { excelRow: 22, ambit: 'Persones', proces: 'Desenvolupament organitzatiu', codi: 'GD01', accio: 'Capacitar Data Stewards en les seves funcions' },
  { excelRow: 23, ambit: 'Persones', proces: 'Desenvolupament organitzatiu', codi: 'GD02', accio: 'Realitzar tallers amb àrees per identificar necessitats' },
  { excelRow: 24, ambit: 'Persones', proces: 'Desenvolupament organitzatiu', codi: 'GD03', accio: "Alinear equips amb l’estratègia de dades" },
  { excelRow: 27, ambit: 'Tecnologia', proces: 'Govern i catalogació', codi: 'MA01', accio: 'Implantar Data Catalog / Inventari de dades' },
  { excelRow: 28, ambit: 'Tecnologia', proces: 'Govern i catalogació', codi: 'MA03', accio: 'Definir i gestionar metadades' },
  { excelRow: 29, ambit: 'Tecnologia', proces: 'Govern i catalogació', codi: 'MA04', accio: 'Desenvolupar model de dades corporatiu' },
  { excelRow: 31, ambit: 'Tecnologia', proces: 'Seguretat i control', codi: 'MB01', accio: "Implementar control d’accessos" },
  { excelRow: 32, ambit: 'Tecnologia', proces: 'Seguretat i control', codi: 'MB02', accio: "Integrar amb sistemes d’identitat" },
  { excelRow: 33, ambit: 'Tecnologia', proces: 'Seguretat i control', codi: 'MB03', accio: 'Implementar logging i traçabilitat' },
  { excelRow: 34, ambit: 'Tecnologia', proces: 'Seguretat i control', codi: 'MB04', accio: 'Xifrat de dades' },
  { excelRow: 36, ambit: 'Tecnologia', proces: 'Integració o arquitectura', codi: 'MC01', accio: 'Desenvolupar ETL/pipelines de dades' },
  { excelRow: 37, ambit: 'Tecnologia', proces: 'Integració o arquitectura', codi: 'MC02', accio: 'Integrar fonts internes i externes' },
  { excelRow: 38, ambit: 'Tecnologia', proces: 'Integració o arquitectura', codi: 'MC03', accio: 'Implementar sistemes de gestió de dades mestres' },
  { excelRow: 40, ambit: 'Tecnologia', proces: 'Qualitat i monitorització', codi: 'MD01', accio: 'Implementar dashboards' },
  { excelRow: 41, ambit: 'Tecnologia', proces: 'Qualitat i monitorització', codi: 'MD01', accio: 'Automatitzar la monitorització' },
  { excelRow: 42, ambit: 'Tecnologia', proces: 'Qualitat i monitorització', codi: 'MD01', accio: 'Implementar alertes automàtiques' },
  { excelRow: 43, ambit: 'Tecnologia', proces: 'Qualitat i monitorització', codi: 'MD01', accio: 'Desplegar eines de data quality' },
  { excelRow: 45, ambit: 'Tecnologia', proces: 'Gestió del cicle de vida de la dada', codi: 'ME01', accio: "Implementar sistemes d’arxiu" },
  { excelRow: 46, ambit: 'Tecnologia', proces: 'Gestió del cicle de vida de la dada', codi: 'ME01', accio: 'Implementar backup i restauració' },
  { excelRow: 49, ambit: 'Organització/Processos', proces: 'Govern i normativa', codi: 'QA01', accio: 'Definir el marc del govern de la dada' },
  { excelRow: 50, ambit: 'Organització/Processos', proces: 'Govern i normativa', codi: 'QA02', accio: 'Definir política de dades' },
  { excelRow: 51, ambit: 'Organització/Processos', proces: 'Govern i normativa', codi: 'QA03', accio: "Establir normes d’accés i seguretat" },
  { excelRow: 52, ambit: 'Organització/Processos', proces: 'Govern i normativa', codi: 'QA04', accio: 'Classificar les dades' },
  { excelRow: 54, ambit: 'Organització/Processos', proces: 'Estratègia i planificació', codi: 'QB01', accio: 'Definir estratègia de dades' },
  { excelRow: 55, ambit: 'Organització/Processos', proces: 'Estratègia i planificació', codi: 'QB02', accio: 'Elaborar roadmap' },
  { excelRow: 56, ambit: 'Organització/Processos', proces: 'Estratègia i planificació', codi: 'QB03', accio: "Definir casos d’ús" },
  { excelRow: 57, ambit: 'Organització/Processos', proces: 'Estratègia i planificació', codi: 'QB04', accio: 'Definir KPIs' },
  { excelRow: 58, ambit: 'Organització/Processos', proces: 'Estratègia i planificació', codi: 'QB05', accio: 'Establir sistema de seguiment' },
  { excelRow: 60, ambit: 'Organització/Processos', proces: 'Estructura de govern', codi: 'QC01', accio: 'Crear comitè de dades' },
  { excelRow: 61, ambit: 'Organització/Processos', proces: 'Estructura de govern', codi: 'QC02', accio: 'Definir model de presa de decisions' },
  { excelRow: 63, ambit: 'Organització/Processos', proces: 'Processos operatius de dades', codi: 'QC01', accio: 'Definir processos de gestió de dades' },
  { excelRow: 64, ambit: 'Organització/Processos', proces: 'Processos operatius de dades', codi: 'QC02', accio: 'Definir workflows' },
  { excelRow: 65, ambit: 'Organització/Processos', proces: 'Processos operatius de dades', codi: 'QC03', accio: "Definir procediments d’integració" },
  { excelRow: 66, ambit: 'Organització/Processos', proces: 'Processos operatius de dades', codi: 'QC04', accio: 'Definir model de dades mestres' },
  { excelRow: 68, ambit: 'Organització/Processos', proces: 'Control i millora contínua', codi: 'QC01', accio: "Definir pla d’auditories" },
  { excelRow: 69, ambit: 'Organització/Processos', proces: 'Control i millora contínua', codi: 'QC02', accio: 'Establir mecanismes de millora contínua' },
  { excelRow: 70, ambit: 'Organització/Processos', proces: 'Control i millora contínua', codi: 'QC03', accio: "Definir gestió d’incidències de dades" },
  { excelRow: 72, ambit: 'Organització/Processos', proces: 'Gestió del cicle de vida de la dada', codi: 'QC01', accio: "Definir polítiques d’arxiu i retenció" },
  { excelRow: 73, ambit: 'Organització/Processos', proces: 'Gestió del cicle de vida de la dada', codi: 'QC02', accio: 'Gestionar dades històriques' },
  { excelRow: 75, ambit: 'Organització/Processos', proces: 'Gestió de la qualitat de dades', codi: 'QC01', accio: 'Definir requeriments de qualitat' },
  { excelRow: 76, ambit: 'Organització/Processos', proces: 'Gestió de la qualitat de dades', codi: 'QC02', accio: 'Establir pla de qualitat' },
  { excelRow: 77, ambit: 'Organització/Processos', proces: 'Gestió de la qualitat de dades', codi: 'QC03', accio: 'Implementar processos de monitorització' },
];

const QUESTIONS_BY_ROW: Record<number, string> = {
  8: "L’organització impulsa accions periòdiques perquè el personal entengui el valor de les dades i les utilitzi en la presa de decisions?",
  9: "Les polítiques de dades es comuniquen de manera clara, accessible i recurrent a totes les àrees implicades?",
  10: "La direcció i els comandaments participen activament en les iniciatives de govern de la dada i en promouen l’adopció?",
  12: "El personal rep formació adequada sobre els principis, les polítiques i els processos de govern de la dada?",
  13: "El personal implicat disposa de formació per aplicar criteris i controls de qualitat de la dada en la seva activitat?",
  14: "Els equips reben formació específica sobre seguretat, privadesa i ús responsable de les dades?",
  15: "Els equips responsables saben gestionar correctament la conservació, l’arxiu i la recuperació de les dades històriques?",
  16: "Les persones usuàries de quadres de comandament estan capacitades per interpretar KPIs, detectar desviacions i prendre decisions basades en dades?",
  18: "S’ha definit i assignat formalment el rol de Data Owner per als dominis o conjunts de dades rellevants?",
  19: "S’ha definit i assignat formalment el rol de Data Steward, amb funcions i dedicació suficients?",
  20: "Cada KPI rellevant té una persona responsable de la seva definició, qualitat, seguiment i actualització?",
  22: "Les persones que exerceixen de Data Steward han estat capacitades per desenvolupar les seves funcions de govern i gestió de dades?",
  23: "Es realitzen tallers amb les àrees per identificar necessitats, problemes i oportunitats relacionades amb les dades?",
  24: "Els objectius i les prioritats dels equips estan alineats amb l’estratègia de dades de l’organització?",
  27: "L’organització disposa d’un catàleg o inventari de dades implantat, actualitzat i utilitzat per les àrees?",
  28: "Les dades disposen de metadades funcionals i tècniques definides, mantingudes i accessibles per a les persones usuàries?",
  29: "Existeix un model de dades corporatiu compartit que estableix entitats, relacions i criteris comuns entre sistemes i àrees?",
  31: "Els accessos a les dades es gestionen segons rols, necessitats de negoci i principi de mínim privilegi?",
  32: "La gestió d’accés a les dades està integrada amb els sistemes corporatius d’identitat i autenticació?",
  33: "Els sistemes registren de manera suficient els accessos, canvis i operacions sobre les dades per garantir-ne la traçabilitat?",
  34: "Les dades sensibles es xifren durant l’emmagatzematge i la transmissió d’acord amb la seva classificació?",
  36: "Existeixen processos ETL o pipelines governats, documentats i monitoritzats per integrar i transformar les dades?",
  37: "Les fonts de dades internes i externes s’integren amb criteris comuns d’interoperabilitat, qualitat i traçabilitat?",
  38: "L’organització disposa d’un sistema per gestionar de manera unificada les dades mestres i evitar duplicitats o inconsistències?",
  40: "S’han implantat quadres de comandament que permeten seguir els indicadors clau de govern, ús i qualitat de les dades?",
  41: "La monitorització de la disponibilitat, qualitat i ús de les dades està automatitzada en els processos rellevants?",
  42: "Existeixen alertes automàtiques que avisen les persones responsables quan es detecten incidències o desviacions en les dades?",
  43: "L’organització utilitza eines de data quality per definir regles, executar controls i gestionar incidències de qualitat?",
  45: "Existeixen sistemes i criteris corporatius per arxivar les dades d’acord amb el seu valor, ús i període de conservació?",
  46: "Els processos de còpia de seguretat i restauració de dades estan implantats, documentats i provats periòdicament?",
  49: "L’organització disposa d’un marc de govern de la dada formal, aprovat i aplicable a totes les àrees?",
  50: "Existeix una política de dades aprovada que estableix principis, responsabilitats i criteris comuns de gestió?",
  51: "S’han definit i aplicat normes corporatives d’accés, ús i seguretat de les dades segons el seu nivell de sensibilitat?",
  52: "Les dades estan classificades amb criteris comuns de sensibilitat, criticitat, confidencialitat i valor per a l’organització?",
  54: "Existeix una estratègia de dades formal, alineada amb els objectius municipals i coneguda per les àrees implicades?",
  55: "L’estratègia de dades es concreta en un full de ruta amb iniciatives, prioritats, responsables, terminis i dependències?",
  56: "S’han identificat i prioritzat casos d’ús de dades vinculats a necessitats reals dels serveis i de la ciutadania?",
  57: "S’han definit KPIs mesurables per avaluar l’execució de l’estratègia i els resultats de les iniciatives de dades?",
  58: "Existeix un sistema periòdic de seguiment, revisió i rendició de comptes sobre l’estratègia i el full de ruta de dades?",
  60: "Existeix un comitè de dades formal, amb representació adequada, funcions definides i reunions periòdiques?",
  61: "S’ha definit un model de presa de decisions que estableix quins òrgans i rols decideixen sobre les dades i com s’escalen els conflictes?",
  63: "Els processos operatius de gestió de dades estan definits, documentats i integrats en el funcionament habitual de les àrees?",
  64: "Els fluxos de treball relacionats amb altes, canvis, validacions i incidències de dades estan definits i assignats?",
  65: "Existeixen procediments comuns i documentats per integrar dades entre sistemes, àrees i organismes externs?",
  66: "S’ha definit un model corporatiu per identificar, governar i mantenir les dades mestres de l’organització?",
  68: "Existeix un pla d’auditories periòdiques per verificar el compliment del marc, les polítiques i els controls de dades?",
  69: "Els resultats de controls, auditories i indicadors es transformen en accions documentades de millora contínua?",
  70: "Existeix un procés comú per registrar, prioritzar, assignar, resoldre i analitzar les incidències de dades?",
  72: "S’han definit polítiques d’arxiu, conservació i eliminació de dades segons els requisits legals i les necessitats del negoci?",
  73: "Les dades històriques es gestionen de manera que se’n garanteixin la conservació, accessibilitat, integritat i traçabilitat?",
  75: "S’han definit requeriments i dimensions de qualitat mesurables per als conjunts de dades prioritaris?",
  76: "Existeix un pla de qualitat de dades amb objectius, controls, responsables, calendari i criteris de seguiment?",
  77: "S’han implantat processos continus de monitorització que mesuren la qualitat de les dades i activen accions correctores?",
};

export const IMPACTE_ACTIONS: ImpacteAction[] = ACTION_ROWS.map((action) => ({
  ...action,
  key: `${action.codi}-r${action.excelRow}`,
  pregunta: QUESTIONS_BY_ROW[action.excelRow],
}));

export const IMPACTE_AMBITS = [...new Set(IMPACTE_ACTIONS.map((action) => action.ambit))];

export function actionsByAmbit(ambit: string): ImpacteAction[] {
  return IMPACTE_ACTIONS.filter((action) => action.ambit === ambit);
}

export function scoreForImpacteAnswer(value: string | undefined): number {
  const score = Number(value);
  return score >= 1 && score <= 4 ? score : 0;
}

export function priorityForImpacteAnswer(value: string | undefined): number | '' {
  const score = scoreForImpacteAnswer(value);
  return score > 0 && score < 4 ? score : '';
}

export function sumImpacteDificultat(
  impacte: string | undefined,
  dificultat: string | undefined,
): number | '' {
  const impacteValue = parseInt(impacte ?? '', 10);
  const dificultatValue = parseInt(dificultat ?? '', 10);
  return Number.isNaN(impacteValue) || Number.isNaN(dificultatValue)
    ? ''
    : impacteValue + dificultatValue;
}

export function calculateImpacteResults(
  answers: Record<string, string>,
): ImpacteAmbitResultat[] {
  return IMPACTE_AMBITS.map((ambit) => {
    const ambitActions = actionsByAmbit(ambit);
    const processNames = [...new Set(ambitActions.map((action) => action.proces))];
    const processos = processNames.map((nom) => ({
      nom,
      puntuacio: averageAnswered(
        ambitActions
          .filter((action) => action.proces === nom)
          .map((action) => scoreForImpacteAnswer(answers[action.key])),
      ),
    }));

    return {
      nom: ambit,
      processos,
      puntuacio: averageAnswered(processos.map((proces) => proces.puntuacio)),
      procesLabels: processos.map((proces) => proces.nom),
      procesScores: processos.map((proces) => proces.puntuacio),
    };
  });
}

export function averageAnswered(values: number[]): number {
  const answered = values.filter((value) => value > 0);
  return answered.length
    ? answered.reduce((sum, value) => sum + value, 0) / answered.length
    : 0;
}
