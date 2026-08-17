export type InventariCollection = 'sistemes' | 'dominis' | 'conjunts' | 'relacions';

export type InventariRow = Record<string, string>;

export interface Inventari3bData {
  sistemes: InventariRow[];
  dominis: InventariRow[];
  conjunts: InventariRow[];
  relacions: InventariRow[];
}

export interface InventariColumn {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'select' | 'computed';
  options?: readonly string[];
  width?: string;
}

export interface InventariSheetConfig {
  collection: InventariCollection;
  title: string;
  itemLabel: string;
  columns: readonly InventariColumn[];
}

export const TIPUS_SERVEI = [
  'On-premise',
  'PaaS (plataforma com a servei)',
  'IaaS (infraestructura com a servei)',
  'SaaS (software com a servei)',
] as const;

export const ARQUITECTURA_CLOUD = ['Pública', 'Híbrida', 'Privada', 'On-premise'] as const;
export const ESTAT_SISTEMES = [
  'En producció',
  "Pendent d'actualització",
  'Obsolet',
  'Substitució planificada',
] as const;
export const CRITICITAT = ['Baixa', 'Mitjana', 'Alta'] as const;
export const AMBITS = [
  'Govern i administració',
  "Gestió de l'espai públic",
  'Serveis a les persones',
  'Corporatiu (Dades mestres i de referència)',
] as const;
export const TIPUS_CONJUNT = [
  'De negoci',
  'Dades de referència',
  'Dades de referència / mestres no homogeneïtzades',
  'Data mestra',
  'Candidat a dades de referència / dades mestres',
] as const;
export const SI_NO = ['Si', 'No'] as const;
export const ALT_VALOR = [
  'Geoespacial',
  'Observació de la terra i el medi ambient',
  'Meteorologia',
  'Estadística',
  'Societats i propietat de societat',
  'Mobilitat',
  'No aplica',
] as const;
export const CADENCIA = [
  'En temps real', 'Diària', 'Setmanal', 'Quinzenal', 'Mensual', 'Trimestral', 'Anual',
  "Major a l'any",
] as const;
export const ORIGENS = [
  'Declaracions de ciutadans',
  'Sistemes municipals interns',
  'Administracions supramunicipals',
  'Sensors o sistemes Iot',
  'Empreses contractistes',
  'Varis',
  'No informat',
] as const;
export const PERSISTENCIA = [
  'Dades transaccionals (es modifiquen constantment)',
  "Dades arxivades (ja no s'utilitzen activament, però es conserven)",
  'Dades històriques (es mantenen per consulta, però no es modifiquen)',
  'No informat',
] as const;
export const RETENCIO = [
  'Arxiu en un sistema separat',
  'Retenció segons normativa legal',
  'Retenció per un període fix (ex. 1, 5, 10 anys)',
  'Retenció segons polítiques internes',
  "Retenció indefinida (les dades no s'eliminen)",
  'No hi ha una política definida',
  'No informat',
] as const;
export const DADES_OBERTES = ['Si', 'No', 'Parcialment', 'Previst a futur', "Pendent d'anàlisi"] as const;
export const REUTILITZACIO = [
  'Planificació estratègica', 'Transparència', 'Optimització de serveis', 'Informes interns',
  'Quadres de comandament',
] as const;
export const ANALISI_RISCOS = [
  'Probabilitat: Baixa\nImpacte: Baix (1)',
  'Probabilitat: Baixa\nImpacte: Moderat (1)',
  'Probabilitat: Baixa\nImpacte: Alt (2)',
  'Probabilitat: Mitja\nImpacte: Baix (1)',
  'Probabilitat: Mitja\nImpacte: Moderat (3)',
  'Probabilitat: Mitja\nImpacte: Alt (4)',
  'Probabilitat: Alta\nImpacte: Baix (3)',
  'Probabilitat: Alta\nImpacte: Moderat (4)',
  'Probabilitat: Alta\nImpacte: Alt (4)',
] as const;

const SISTEMES_COLUMNS: readonly InventariColumn[] = [
  { key: 'nom', label: 'Sistema de dades', width: '18rem' },
  { key: 'descripcio', label: 'Descripció', type: 'textarea', width: '22rem' },
  { key: 'tecnologies', label: 'Tecnologies principals', width: '18rem' },
  { key: 'proveidor', label: 'Proveïdor', width: '16rem' },
  { key: 'tipusServei', label: 'Tipus de servei', type: 'select', options: TIPUS_SERVEI },
  { key: 'arquitecturaCloud', label: 'Arquitectura cloud', type: 'select', options: ARQUITECTURA_CLOUD },
  { key: 'estat', label: 'Estat Sistema', type: 'select', options: ESTAT_SISTEMES },
  { key: 'dataRevisio', label: 'Data revisió estat', type: 'date' },
  { key: 'administradorNom', label: 'Administrador del sistema (nom)' },
  { key: 'administradorRol', label: 'Administrador del sistema (rol)' },
  { key: 'criticitat', label: 'Criticitat', type: 'select', options: CRITICITAT },
  { key: 'integracions', label: 'Integracions', type: 'textarea' },
  { key: 'autenticacio', label: "Model d'autenticació" },
  { key: 'nombreConjunts', label: 'Núm. Conjunts de dades', type: 'computed' },
];

const DOMINIS_COLUMNS: readonly InventariColumn[] = [
  { key: 'nom', label: 'Domini de dades', width: '18rem' },
  { key: 'descripcio', label: 'Descripció', type: 'textarea', width: '26rem' },
  { key: 'ambit', label: 'Àmbit', type: 'select', options: AMBITS, width: '18rem' },
  { key: 'areaPropietaria', label: 'Àrea propietària', width: '18rem' },
  { key: 'nombreConjunts', label: 'Núm. Conjunts de dades', type: 'computed' },
];

export const RISK_KEYS = [
  'riscIncoherencia', 'riscDesactualitzada', 'riscPublicacioIncorrecta', 'riscDuplicats',
  'riscAccesSensibles', 'riscUsIndegut', 'riscExposicio', 'riscFuita', 'riscIndisponibilitat',
  'riscPerdua', 'riscTracabilitat', 'riscAuditories', 'riscRespostaIncidents',
] as const;

const risc = (key: string, label: string): InventariColumn => ({
  key, label, type: 'select', options: ANALISI_RISCOS, width: '17rem',
});

const CONJUNTS_COLUMNS: readonly InventariColumn[] = [
  { key: 'nom', label: 'Nom Conjunt de dades', width: '20rem' },
  { key: 'descripcio', label: 'Descripció', type: 'textarea', width: '26rem' },
  { key: 'domini', label: 'Domini de dades', type: 'select', width: '18rem' },
  { key: 'areaPropietaria', label: 'Àrea propietària (Calculat pel Domini)', type: 'computed', width: '18rem' },
  { key: 'tipus', label: 'Tipus conjunt de dades', type: 'select', options: TIPUS_CONJUNT },
  { key: 'usPrevist', label: 'Ús previst de les dades', type: 'textarea' },
  { key: 'dadesPersonals', label: 'Conté dades personals?', type: 'select', options: SI_NO },
  { key: 'dadesGenere', label: "Conté dades de gènere u orientació sexual?", type: 'select', options: SI_NO },
  { key: 'dadesIdeologia', label: "Conté dades d'ideologia o creences?", type: 'select', options: SI_NO },
  { key: 'dadesBiometriques', label: 'Conté dades biomètriques?', type: 'select', options: SI_NO },
  { key: 'dadesSalut', label: 'Conté dades de salut?', type: 'select', options: SI_NO },
  { key: 'dadesConfidencials', label: "Conté dades confidencials de l'ens local?", type: 'select', options: SI_NO },
  { key: 'dadesSeguretat', label: 'Conté dades de seguretat i accés?', type: 'select', options: SI_NO },
  { key: 'responsableNom', label: 'Nom del responsable del Conjunt de dades (Propietari de dades)' },
  { key: 'responsableCarrec', label: 'Càrrec del responsable del conjunt de dades' },
  { key: 'gestorNom', label: 'Nom del gestor del Conjunt de dades' },
  { key: 'gestorCarrec', label: 'Càrrec del gestor del conjunt de dades' },
  { key: 'custodiNom', label: 'Nom del custodi del Conjunt de dades' },
  { key: 'custodiCarrec', label: 'Càrrec del custodi del conjunt de dades' },
  { key: 'categoriaAltValor', label: "Categoria de les dades d'alt valor", type: 'select', options: ALT_VALOR },
  { key: 'cadencia', label: "Cadència d'actualització", type: 'select', options: CADENCIA },
  { key: 'origen', label: 'Origen de les dades', type: 'select', options: ORIGENS },
  { key: 'persistencia', label: 'Persistència', type: 'select', options: PERSISTENCIA },
  { key: 'retencio', label: 'Retenció', type: 'select', options: RETENCIO },
  { key: 'disponibilitatHistorica', label: 'Disponibilitat històrica', type: 'select', options: SI_NO },
  { key: 'restriccionsObertes', label: 'Restriccions dades obertes', type: 'select', options: DADES_OBERTES },
  { key: 'reutilitzacio', label: 'Reutilització de dades', type: 'select', options: REUTILITZACIO },
  risc('riscIncoherencia', 'Incoherència de dades'),
  risc('riscDesactualitzada', 'Informació desactualitzada'),
  risc('riscPublicacioIncorrecta', "Publicació d'informació incorrecta"),
  risc('riscDuplicats', 'Registres duplicats'),
  risc('riscAccesSensibles', 'Accés a dades sensibles'),
  risc('riscUsIndegut', 'Accés o ús indegut'),
  risc('riscExposicio', 'Exposició de dades (menors, personals, sensibles o socials)'),
  risc('riscFuita', 'Filtració o fuita de dades'),
  risc('riscIndisponibilitat', 'Indisponiblitat del sistema'),
  risc('riscPerdua', 'Pèrdua de dades'),
  risc('riscTracabilitat', 'Falta de traçabilitat i evidències sobre la gestió de les dades'),
  risc('riscAuditories', 'Falta de seguiment o auditories sobre accessos i usos'),
  risc('riscRespostaIncidents', 'Falta de pla de resposta a incidents'),
  { key: 'nivellRisc', label: 'Nivell de risc general', type: 'computed' },
  { key: 'observacions', label: 'Observacions', type: 'textarea', width: '20rem' },
  { key: 'nombreSistemes', label: "Núm. Sistemes d'informació", type: 'computed' },
  { key: 'nombreDominis', label: 'Núm. Dominis de dades', type: 'computed' },
];

const RELACIONS_COLUMNS: readonly InventariColumn[] = [
  { key: 'conjunt', label: 'Conjunt de dades', type: 'select', width: '22rem' },
  { key: 'sistema', label: 'Sistema de dades', type: 'select', width: '22rem' },
  { key: 'descripcio', label: 'Descripció de la relació', type: 'textarea', width: '24rem' },
  { key: 'controlConjunt', label: 'Control conjunts de dades', type: 'computed' },
  { key: 'controlSistema', label: "Control sistemes d'informació", type: 'computed' },
  { key: 'controlRelacio', label: 'Control relacions correctes', type: 'computed' },
];

export const INVENTARI_SHEETS: Record<InventariCollection, InventariSheetConfig> = {
  sistemes: { collection: 'sistemes', title: 'Sistemes de dades', itemLabel: 'sistema', columns: SISTEMES_COLUMNS },
  dominis: { collection: 'dominis', title: 'Dominis de dades', itemLabel: 'domini', columns: DOMINIS_COLUMNS },
  conjunts: { collection: 'conjunts', title: 'Conjunts de dades', itemLabel: 'conjunt de dades', columns: CONJUNTS_COLUMNS },
  relacions: { collection: 'relacions', title: 'Relacions de Conjunts de dades amb sistemes', itemLabel: 'relació', columns: RELACIONS_COLUMNS },
};

export const COMPLETION_KEYS = {
  sistemes: SISTEMES_COLUMNS.filter((column) => column.type !== 'computed' && column.key !== 'nom').map((column) => column.key),
  dominis: DOMINIS_COLUMNS.filter((column) => column.type !== 'computed' && column.key !== 'nom').map((column) => column.key),
  conjunts: CONJUNTS_COLUMNS.slice(1, 27).map((column) => column.key),
} as const;

export function emptyInventari3b(): Inventari3bData {
  return { sistemes: [], dominis: [], conjunts: [], relacions: [] };
}

export function riskGrade(value: string): number {
  const match = value.match(/\(([1-4])\)$/);
  return match ? Number(match[1]) : 0;
}