import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';

const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
admin.initializeApp(
  fs.existsSync(serviceAccountPath)
    ? { credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))) }
    : { credential: admin.credential.applicationDefault() },
);

const db = admin.firestore();
const slug = 'veciana';
const riskLow = 'Probabilitat: Baixa\nImpacte: Moderat (1)';
const riskMedium = 'Probabilitat: Mitja\nImpacte: Moderat (3)';

const people = {
  gerencia: { name: 'Marta Rius Ferrer', email: 'marta.rius@veciana.cat', phone: '938 010 101' },
  dades: { name: 'Jordi Casals Puig', email: 'jordi.casals@veciana.cat', phone: '938 010 122' },
  tic: { name: 'Laia Soler Bosch', email: 'laia.soler@veciana.cat', phone: '938 010 120' },
  secretaria: { name: 'Nuria Vidal Serra', email: 'nuria.vidal@veciana.cat', phone: '938 010 103' },
  padro: { name: 'Anna Ferrer Costa', email: 'anna.ferrer@veciana.cat', phone: '938 010 115' },
  urbanisme: { name: 'Pau Vila Roca', email: 'pau.vila@veciana.cat', phone: '938 010 131' },
  socials: { name: 'Clara Prat Soler', email: 'clara.prat@veciana.cat', phone: '938 010 141' },
};

const owner = (person: { name: string; email: string }, unit: string) => ({
  refGovern: person.name,
  emailRefGov: person.email,
  unitatRefGov: unit,
  respFuncional: person.name,
  emailRespFunc: person.email,
  unitatRespFunc: unit,
});

const glossaryRow = (
  terme: string,
  descripcio: string,
  dominiFuncional: string,
  tipus: string,
  descFormat: string,
  person: { name: string; email: string },
  unit: string,
  extra: Partial<Record<'formula' | 'comentaris' | 'alies', string>> = {},
) => ({
  terme,
  descripcio,
  dominiFuncional,
  tipus,
  descFormat,
  formula: extra.formula ?? 'No aplica',
  comentaris: extra.comentaris ?? 'Definicio validada pel responsable funcional',
  alies: extra.alies ?? '',
  ...owner(person, unit),
});

const system = (
  nomCurt: string,
  descripcio: string,
  tipus: string,
  proveidor: string,
  extern: 'Si' | 'No' = 'No',
) => ({
  nomCurt,
  extern,
  descripcio,
  tipus,
  proveidor,
  adminSis: people.tic.name,
  adminEmail: people.tic.email,
  adminUnitat: 'Tecnologies de la Informacio',
  arqDada: people.dades.name,
  arqEmail: people.dades.email,
  arqUnitat: 'Oficina de Dades',
});

const entity = (
  nom: string,
  descripcio: string,
  sistemaNom: string,
  tipus: string,
  responsable: { name: string; email: string },
  unitat: string,
  personals: 'SI' | 'NO',
  criticitat: 'SI' | 'NO',
) => ({
  nom,
  descripcio,
  sistema: sistemaNom,
  termesGlossari: nom,
  tipus,
  infoGeografica: nom.includes('Immobles') || nom.includes('Llicencies') ? 'SI' : 'NO',
  infoCiutadania: personals,
  infoEmpreses: nom.includes('Expedients') || nom.includes('Tributs') ? 'SI' : 'NO',
  infoGenere: nom.includes('Habitants') || nom.includes('Persones usuaries') ? 'SI' : 'NO',
  valoracioLlindar: personals === 'SI' ? 'Risc mitja de reidentificacio' : 'Risc baix',
  valoracioEsbiaixos: 'Revisio anual dins del pla de qualitat',
  valoracioQualitat: criticitat === 'SI' ? '96%' : '91%',
  proteccioDades: personals === 'SI' ? 'Personals' : 'No personals',
  visibilitat: personals === 'SI' ? "Intern per l'ens local" : 'Public',
  intraoperabilitat: 'SI',
  interoperabilitat: 'SI',
  interesCiutadania: 'SI',
  obertura: personals === 'SI' ? "No obert, es podria obrir parcialment" : 'Obert',
  restriccionsObertura: personals === 'SI' ? 'Anonimitzacio i minimitzacio previa' : 'Sense restriccions',
  entUnicaVegada: 'SI',
  llengControlats: 'SI',
  completesHistoric: '94%',
  completesActuals: '97%',
  enviamentsPeriodics: 'SI',
  criticitat,
  quadresComandament: 'SI',
  referentTecnic: responsable.name,
  emailReferent: responsable.email,
  unitatReferent: unitat,
  arquitecteDada: people.dades.name,
  emailArquitecte: people.dades.email,
  unitatArquitecte: 'Oficina de Dades',
  observacions: 'Conjunt revisat durant el diagnostic de governanca 2026',
});

const attribute = (
  id: string,
  nom: string,
  desc: string,
  entitat: string,
  sistemaNom: string,
  format: string,
  sensible: 'SI' | 'NO',
  clau: 'SI' | 'NO' = 'NO',
) => ({
  id,
  nom,
  desc,
  entitat,
  clau,
  sistema: sistemaNom,
  tipus: clau === 'SI' ? 'Dada mestre' : 'Dada de negoci',
  sensible,
  terme: nom,
  format,
  nul: clau === 'SI' ? 'NO' : 'SI',
  unicitat: clau === 'SI' ? 'Unica' : 'No unica',
  completesa: clau === 'SI' ? '100%' : '96%',
  consistencia: 'Alta',
  actualizacio: entitat === 'Habitants' ? 'Diaria' : 'Setmanal',
});

const system3b = (
  nom: string,
  descripcio: string,
  tecnologies: string,
  proveidor: string,
  tipusServei: string,
  criticitat: string,
  integracions: string,
) => ({
  nom,
  descripcio,
  tecnologies,
  proveidor,
  tipusServei,
  arquitecturaCloud: tipusServei === 'On-premise' ? 'On-premise' : 'Hibrida',
  estat: 'En produccio',
  dataRevisio: '2026-06-30',
  administradorNom: people.tic.name,
  administradorRol: 'Responsable de Sistemes',
  criticitat,
  integracions,
  autenticacio: 'Directori corporatiu i doble factor per a perfils privilegiats',
});

const domain = (nom: string, descripcio: string, ambit: string, areaPropietaria: string) => ({
  nom,
  descripcio,
  ambit,
  areaPropietaria,
});

const dataset = (
  nom: string,
  descripcio: string,
  domini: string,
  area: string,
  responsable: { name: string },
  personal: boolean,
  cadencia: string,
) => ({
  nom,
  descripcio,
  domini,
  tipus: personal ? 'Data mestra' : 'De negoci',
  usPrevist: 'Gestio operativa, planificacio, seguiment i rendicio de comptes',
  dadesPersonals: personal ? 'Si' : 'No',
  dadesGenere: personal ? 'Si' : 'No',
  dadesIdeologia: 'No',
  dadesBiometriques: 'No',
  dadesSalut: domini === 'Atencio a les persones' ? 'Si' : 'No',
  dadesConfidencials: personal ? 'Si' : 'No',
  dadesSeguretat: 'No',
  responsableNom: responsable.name,
  responsableCarrec: `Cap de ${area}`,
  gestorNom: responsable.name,
  gestorCarrec: `Referent de dades de ${area}`,
  custodiNom: people.tic.name,
  custodiCarrec: 'Responsable de Sistemes',
  categoriaAltValor: domini === 'Territori' ? 'Geoespacial' : 'No aplica',
  cadencia,
  origen: personal ? 'Declaracions de ciutadans' : 'Sistemes municipals interns',
  persistencia: 'Dades transaccionals (es modifiquen constantment)',
  retencio: 'Retencio segons normativa legal',
  disponibilitatHistorica: 'Si',
  restriccionsObertes: personal ? 'Parcialment' : 'Si',
  reutilitzacio: 'Quadres de comandament',
  riscIncoherencia: riskMedium,
  riscDesactualitzada: riskMedium,
  riscPublicacioIncorrecta: riskLow,
  riscDuplicats: riskMedium,
  riscAccesSensibles: personal ? riskMedium : riskLow,
  riscUsIndegut: personal ? riskMedium : riskLow,
  riscExposicio: personal ? riskMedium : riskLow,
  riscFuita: personal ? riskMedium : riskLow,
  riscIndisponibilitat: riskMedium,
  riscPerdua: riskLow,
  riscTracabilitat: riskLow,
  riscAuditories: riskLow,
  riscRespostaIncidents: riskLow,
  observacions: 'Avaluacio inicial completada el juliol de 2026',
});

const responsibilityRow = (
  name: string,
  person: { name: string; email: string; phone: string },
  areas: string[],
  obs: string,
) => ({ name, resp: person.name, email: person.email, phone: person.phone, obs, areas });

const questionIds = [
  'GA01', 'GA02', 'GB01', 'GB02', 'GC01', 'GD01', 'GD02', 'GD03',
  'MA01', 'MA02', 'MB01', 'MC01', 'MC02', 'MD01', 'ME01', 'QA01', 'QB01', 'QC01',
];

const answers = Object.fromEntries(questionIds.map((id, index) => [id, index % 5 === 0 ? '2' : '3']));
const observacions = Object.fromEntries(questionIds.map((id) => [
  id,
  'Valoracio consensuada amb les arees durant els tallers de diagnostic de juny de 2026.',
]));
const evidencies = Object.fromEntries(questionIds.map((id) => [
  id,
  `Evidencia ${id}: procediment intern, acta de seguiment i indicador del quadre de comandament.`,
]));

const pages: Record<string, unknown> = {
  'mapa-responsables': {
    rolsClau: [
      responsibilityRow('Patrocinadora del govern de la dada', people.gerencia, ['Gerencia'], 'Impulsa el programa i resol prioritats.'),
      responsibilityRow('Responsable de govern de la dada', people.dades, ['Oficina de Dades'], 'Coordina el model i el comite mensual.'),
      responsibilityRow('Arquitecta de dades', people.tic, ['Tecnologies de la Informacio'], 'Garanteix arquitectura, seguretat i integracions.'),
      responsibilityRow('Delegada de proteccio de dades', people.secretaria, ['Secretaria General'], 'Supervisa RGPD, ENS i registres de tractament.'),
    ],
    arees: [
      responsibilityRow('Secretaria General', people.secretaria, ['Govern i administracio'], 'Fe publica, expedients i transparencia.'),
      responsibilityRow('Tecnologies de la Informacio', people.tic, ['Corporatiu'], 'Custodia tecnica de plataformes i dades.'),
      responsibilityRow('Poblacio i Atencio Ciutadana', people.padro, ['Serveis a les persones'], 'Gestio del padro i canals ciutadans.'),
      responsibilityRow('Territori i Urbanisme', people.urbanisme, ["Gestio de l'espai public"], 'Planejament, llicencies i informació territorial.'),
      responsibilityRow('Drets Socials', people.socials, ['Serveis a les persones'], 'Atencio social i programes comunitaris.'),
    ],
    processos: [
      responsibilityRow('Alta i canvi de domicili al padro', people.padro, ['Poblacio i Atencio Ciutadana'], 'Proces critic amb intercanvi INE.'),
      responsibilityRow("Tramitacio de llicencies urbanistiques", people.urbanisme, ['Territori i Urbanisme'], 'Inclou cartografia i expedient electronic.'),
      responsibilityRow('Valoracio de necessitats socials', people.socials, ['Drets Socials'], 'Tractament de categories especials de dades.'),
    ],
    projectes: [
      responsibilityRow('Pla de Transformacio Digital 2026-2028', people.tic, ['Tecnologies de la Informacio'], 'Integra carpeta ciutadana i govern de la dada.'),
      responsibilityRow('Quadre de comandament de ciutat', people.dades, ['Oficina de Dades'], 'Indicadors de poblacio, territori i serveis.'),
    ],
    altres: [
      responsibilityRow('Comite de Seguretat i Dades', people.secretaria, ['Transversal'], 'Reunio mensual amb actes i seguiment de riscos.'),
    ],
    orgData: [
      { id: '1', parentId: '', name: people.gerencia.name, position: 'Gerent municipal' },
      { id: '2', parentId: '1', name: people.secretaria.name, position: 'Secretaria general i DPD' },
      { id: '3', parentId: '1', name: people.dades.name, position: 'Responsable de Govern de la Dada' },
      { id: '4', parentId: '3', name: people.tic.name, position: 'Responsable TIC i Arquitecta de Dades' },
      { id: '5', parentId: '1', name: people.padro.name, position: 'Cap de Poblacio i OAC' },
      { id: '6', parentId: '1', name: people.urbanisme.name, position: 'Cap de Territori i Urbanisme' },
      { id: '7', parentId: '1', name: people.socials.name, position: 'Cap de Drets Socials' },
    ],
  },
  questionari: { answers, observacions, evidencies },
  'pla-accions': {
    impactes: Object.fromEntries(questionIds.map((id, index) => [id, index % 3 === 0 ? '1 - Alt' : '2 - Mig'])),
    dificultats: Object.fromEntries(questionIds.map((id, index) => [id, index % 4 === 0 ? '3 - Alta' : '2 - Mitja'])),
    terminis: Object.fromEntries(questionIds.map((id, index) => [id, index % 3 === 0 ? 'Curt termini (0 – 6 Mesos)' : 'Mig termini (6 – 18 mesos)'])),
  },
  sistemas: {
    sistemas: [
      system('Gestiona', 'Gestor corporatiu d expedients i registre electronic', 'Gestio administrativa', 'EsPublico', 'Si'),
      system('Empadrona', 'Gestio del padro municipal de 40.000 habitants', 'Padro i poblacio', 'Aytos-Berger Levrault'),
      system('Sicalwin', 'Comptabilitat, pressupost i tresoreria municipal', 'Gestio economica', 'Aytos-Berger Levrault'),
      system('QGIS-SITMUN', 'Sistema d informacio territorial i cartografia municipal', 'Sistema GIS', 'Diputacio de Barcelona'),
      system('Hestia', 'Gestio d expedients de serveis socials basics', 'Serveis socials', 'Diputacio de Barcelona', 'Si'),
      system('Power BI', 'Plataforma de quadres de comandament municipals', 'Analitica i BI', 'Microsoft', 'Si'),
    ],
  },
  entitats: {
    entitats: [
      entity('Habitants', 'Persones inscrites al padro municipal', 'Empadrona', 'Dada mestre', people.padro, 'Poblacio i Atencio Ciutadana', 'SI', 'SI'),
      entity('Domicilis', 'Adreces i unitats poblacionals normalitzades', 'Empadrona', 'Dada de referencia', people.padro, 'Poblacio i Atencio Ciutadana', 'SI', 'SI'),
      entity('Expedients administratius', 'Expedients electronics tramitats per les arees municipals', 'Gestiona', 'Dada de negoci', people.secretaria, 'Secretaria General', 'SI', 'SI'),
      entity('Immobles i parceles', 'Informacio cadastral i territorial del municipi', 'QGIS-SITMUN', 'Dada de referencia', people.urbanisme, 'Territori i Urbanisme', 'NO', 'SI'),
      entity('Llicencies urbanistiques', 'Sollicituds, informes i resolucions urbanistiques', 'Gestiona', 'Dada de negoci', people.urbanisme, 'Territori i Urbanisme', 'SI', 'SI'),
      entity('Persones usuaries de serveis socials', 'Persones i unitats familiars ateses pels serveis socials basics', 'Hestia', 'Dada mestre', people.socials, 'Drets Socials', 'SI', 'SI'),
      entity('Tributs municipals', 'Rebuts, liquidacions i estat de cobrament dels ingressos municipals', 'Sicalwin', 'Dada de negoci', people.secretaria, 'Serveis Economics', 'SI', 'SI'),
      entity('Indicadors municipals', 'Indicadors agregats per al seguiment de serveis i politiques publiques', 'Power BI', 'Dada analitica', people.dades, 'Oficina de Dades', 'NO', 'NO'),
    ],
  },
  atributs: {
    atributs: [
      attribute('HAB-001', 'Id habitant', 'Identificador intern pseudonimitzat', 'Habitants', 'Empadrona', 'UUID', 'SI', 'SI'),
      attribute('HAB-002', 'Document identificatiu', 'DNI, NIE o passaport de la persona', 'Habitants', 'Empadrona', 'VARCHAR(20)', 'SI'),
      attribute('HAB-003', 'Nom i cognoms', 'Nom complet declarat al padro', 'Habitants', 'Empadrona', 'VARCHAR(180)', 'SI'),
      attribute('HAB-004', 'Data de naixement', 'Data de naixement de la persona', 'Habitants', 'Empadrona', 'DATE', 'SI'),
      attribute('HAB-005', 'Genere', 'Valor declarat segons el model padronal', 'Habitants', 'Empadrona', 'VARCHAR(30)', 'SI'),
      attribute('DOM-001', 'Codi via', 'Codi unic de la via municipal', 'Domicilis', 'Empadrona', 'VARCHAR(12)', 'NO', 'SI'),
      attribute('DOM-002', 'Adreca normalitzada', 'Tipus de via, nom, numero i complements', 'Domicilis', 'Empadrona', 'VARCHAR(255)', 'SI'),
      attribute('EXP-001', 'Numero expedient', 'Identificador unic de l expedient electronic', 'Expedients administratius', 'Gestiona', 'VARCHAR(30)', 'NO', 'SI'),
      attribute('EXP-002', 'Data obertura', 'Data d inici formal de la tramitacio', 'Expedients administratius', 'Gestiona', 'DATE', 'NO'),
      attribute('URB-001', 'Referencia cadastral', 'Identificador cadastral de l immoble', 'Immobles i parceles', 'QGIS-SITMUN', 'VARCHAR(20)', 'NO', 'SI'),
      attribute('URB-002', 'Geometria', 'Geometria oficial de la parcella', 'Immobles i parceles', 'QGIS-SITMUN', 'MULTIPOLYGON', 'NO'),
      attribute('SOC-001', 'Id cas social', 'Identificador pseudonimitzat de la intervencio', 'Persones usuaries de serveis socials', 'Hestia', 'UUID', 'SI', 'SI'),
      attribute('SOC-002', 'Tipus necessitat', 'Classificacio de la necessitat social detectada', 'Persones usuaries de serveis socials', 'Hestia', 'VARCHAR(80)', 'SI'),
      attribute('IND-001', 'Valor indicador', 'Valor numeric observat del periode', 'Indicadors municipals', 'Power BI', 'DECIMAL(18,2)', 'NO'),
    ],
  },
  'inventari-3b': {
    sistemes: [
      system3b('Gestiona', 'Expedient, registre i tramitacio electronica', '.NET, SQL Server, serveis web', 'EsPublico', 'SaaS (software com a servei)', 'Alta', 'EACAT, e-NOTUM, Via Oberta i carpeta ciutadana'),
      system3b('Empadrona', 'Gestio padronal i intercanvis mensuals amb l INE', 'Java, Oracle, SFTP', 'Aytos-Berger Levrault', 'On-premise', 'Alta', 'INE, Gestiona i carpeta ciutadana'),
      system3b('Sicalwin', 'Comptabilitat i gestio pressupostaria', '.NET, Oracle', 'Aytos-Berger Levrault', 'On-premise', 'Alta', 'ORGT, plataforma de contractacio i Gestiona'),
      system3b('QGIS-SITMUN', 'Cartografia i informacio territorial municipal', 'PostgreSQL/PostGIS, QGIS, OGC', 'Diputacio de Barcelona', 'PaaS (plataforma com a servei)', 'Mitjana', 'Cadastre, planejament i portal de dades obertes'),
      system3b('Hestia', 'Gestio de serveis socials basics', 'Aplicacio web i serveis interoperables', 'Diputacio de Barcelona', 'SaaS (software com a servei)', 'Alta', 'Historia social compartida i padró'),
      system3b('Power BI', 'Analitica municipal i quadres de comandament', 'Power BI, Dataflows, SQL', 'Microsoft', 'SaaS (software com a servei)', 'Mitjana', 'Fonts corporatives mitjancant passarella segura'),
    ],
    dominis: [
      domain('Poblacio', 'Persones residents, domicilis i moviments padronals', 'Corporatiu (Dades mestres i de referencia)', 'Poblacio i Atencio Ciutadana'),
      domain('Administracio electronica', 'Registre, expedients, documents i notificacions', 'Govern i administracio', 'Secretaria General'),
      domain('Territori', 'Parcelari, planejament, llicencies i via publica', "Gestio de l'espai public", 'Territori i Urbanisme'),
      domain('Atencio a les persones', 'Serveis socials, educacio, cultura i esports', 'Serveis a les persones', 'Drets Socials'),
      domain('Hisenda municipal', 'Pressupost, comptabilitat, ingressos i despesa', 'Govern i administracio', 'Serveis Economics'),
    ],
    conjunts: [
      dataset('Padro municipal d habitants', 'Inscripcions i moviments del padro continu de 40.000 habitants', 'Poblacio', 'Poblacio i Atencio Ciutadana', people.padro, true, 'Diaria'),
      dataset('Carrerer municipal', 'Vies, trams, numeracio i unitats poblacionals normalitzades', 'Poblacio', 'Poblacio i Atencio Ciutadana', people.padro, false, 'Mensual'),
      dataset('Expedients electronics', 'Metadades i estat de la tramitacio administrativa', 'Administracio electronica', 'Secretaria General', people.secretaria, true, 'En temps real'),
      dataset('Llicencies urbanistiques', 'Sollicituds, informes, resolucions i geometries associades', 'Territori', 'Territori i Urbanisme', people.urbanisme, true, 'Diaria'),
      dataset('Parcelari cadastral', 'Parcel·les, immobles i referencia cadastral', 'Territori', 'Territori i Urbanisme', people.urbanisme, false, 'Trimestral'),
      dataset('Atencions socials', 'Demandes, diagnostics, recursos i seguiment de casos', 'Atencio a les persones', 'Drets Socials', people.socials, true, 'Diaria'),
      dataset('Execucio pressupostaria', 'Pressupost inicial, modificacions, obligacions i pagaments', 'Hisenda municipal', 'Serveis Economics', people.secretaria, false, 'Diaria'),
      dataset('Indicadors de ciutat', 'Series agregades per al seguiment del PAM i dels serveis', 'Administracio electronica', 'Oficina de Dades', people.dades, false, 'Mensual'),
    ],
    relacions: [
      { conjunt: 'Padro municipal d habitants', sistema: 'Empadrona', descripcio: 'Sistema mestre i font oficial del conjunt' },
      { conjunt: 'Carrerer municipal', sistema: 'Empadrona', descripcio: 'Carrerer operatiu utilitzat en la gestio padronal' },
      { conjunt: 'Carrerer municipal', sistema: 'QGIS-SITMUN', descripcio: 'Representacio geografica i manteniment de coordenades' },
      { conjunt: 'Expedients electronics', sistema: 'Gestiona', descripcio: 'Creacio i custodia de l expedient electronic' },
      { conjunt: 'Llicencies urbanistiques', sistema: 'Gestiona', descripcio: 'Tramitacio administrativa de les llicencies' },
      { conjunt: 'Llicencies urbanistiques', sistema: 'QGIS-SITMUN', descripcio: 'Localitzacio geografica de les actuacions' },
      { conjunt: 'Parcelari cadastral', sistema: 'QGIS-SITMUN', descripcio: 'Consulta i analisi territorial del parcelari' },
      { conjunt: 'Atencions socials', sistema: 'Hestia', descripcio: 'Gestio integral de la historia social' },
      { conjunt: 'Execucio pressupostaria', sistema: 'Sicalwin', descripcio: 'Font economica i comptable oficial' },
      { conjunt: 'Indicadors de ciutat', sistema: 'Power BI', descripcio: 'Model semantic i visualitzacio dels indicadors' },
    ],
  },
  glossari: {
    dadesMestres: [
      glossaryRow('Habitant', 'Persona inscrita al padro municipal d habitants de Veciana', 'Poblacio', 'Dada mestre', 'Text i identificador intern', people.padro, 'Poblacio i Atencio Ciutadana', { alies: 'resident, persona empadronada' }),
      glossaryRow('Domicili', 'Lloc de residencia declarat i normalitzat al carrerer municipal', 'Poblacio', 'Dada mestre', 'Codi de via, numero i complements', people.padro, 'Poblacio i Atencio Ciutadana', { alies: 'adreca padronal' }),
      glossaryRow('Tercer', 'Persona fisica o juridica relacionada amb un procediment municipal', 'Administracio electronica', 'Dada mestre', 'Identificador i dades de contacte', people.secretaria, 'Secretaria General', { alies: 'interessat, representant' }),
      glossaryRow('Immoble', 'Be immoble identificat mitjancant referencia cadastral', 'Territori', 'Dada mestre', 'Referencia cadastral de 20 caracters', people.urbanisme, 'Territori i Urbanisme'),
    ],
    dadesReferencia: [
      glossaryRow('Codi de via', 'Identificador unic de cada via del municipi', 'Poblacio', 'Dada de referencia', 'Text de 12 caracters', people.padro, 'Poblacio i Atencio Ciutadana'),
      glossaryRow('Unitat organica', 'Area o servei vigent a l organigrama municipal', 'Organitzacio', 'Dada de referencia', 'Codi i denominacio oficial', people.secretaria, 'Secretaria General'),
      glossaryRow('Tipus d expedient', 'Classificacio funcional dels procediments administratius', 'Administracio electronica', 'Dada de referencia', 'Codi de quadre de classificacio', people.secretaria, 'Secretaria General'),
      glossaryRow('Classificacio pressupostaria', 'Codificacio organica, economica i per programes del pressupost', 'Hisenda municipal', 'Dada de referencia', 'Codis pressupostaris normalitzats', people.secretaria, 'Serveis Economics'),
    ],
    dadesNegoci: [
      glossaryRow('Poblacio resident', 'Nombre de persones amb inscripcio padronal activa a la data de referencia', 'Poblacio', 'Indicador', 'Enter', people.padro, 'Poblacio i Atencio Ciutadana', { formula: 'Recompte d inscripcions actives a final de periode', comentaris: 'Poblacio de referencia aproximada: 40.000 habitants' }),
      glossaryRow('Temps mitja de tramitacio', 'Dies naturals entre l inici i la resolucio d un expedient', 'Administracio electronica', 'Metica', 'Decimal en dies', people.secretaria, 'Secretaria General', { formula: 'Suma de dies de tramitacio / expedients resolts' }),
      glossaryRow('Execucio pressupostaria', 'Percentatge d obligacions reconegudes sobre el credit definitiu', 'Hisenda municipal', 'Metrica', 'Percentatge amb dos decimals', people.secretaria, 'Serveis Economics', { formula: 'Obligacions reconegudes / credit definitiu * 100' }),
      glossaryRow('Persones ateses', 'Persones uniques amb una intervencio social oberta durant el periode', 'Atencio a les persones', 'Indicador', 'Enter', people.socials, 'Drets Socials', { formula: 'Recompte distincte d identificadors de persona' }),
      glossaryRow('Llicencia resolta', 'Expedient urbanistic amb resolucio notificada i ferma', 'Territori', 'Estat de negoci', 'Boolea', people.urbanisme, 'Territori i Urbanisme'),
    ],
  },
  'relacion-glossari': {
    relacions: [
      { termeOrigen: 'Habitant', termeRelacionat: 'Domicili', tipusRelacio: 'Associacio (un habitant resideix en un domicili)' },
      { termeOrigen: 'Habitant', termeRelacionat: 'Tercer', tipusRelacio: 'Correspondencia (una persona empadronada pot actuar com a tercer)' },
      { termeOrigen: 'Domicili', termeRelacionat: 'Codi de via', tipusRelacio: 'Relacio jerarquica (el domicili utilitza una via normalitzada)' },
      { termeOrigen: 'Immoble', termeRelacionat: 'Llicencia resolta', tipusRelacio: 'Associacio (una llicencia pot afectar un immoble)' },
      { termeOrigen: 'Unitat organica', termeRelacionat: 'Tipus d expedient', tipusRelacio: 'Responsabilitat (la unitat tramita el tipus d expedient)' },
      { termeOrigen: 'Execucio pressupostaria', termeRelacionat: 'Classificacio pressupostaria', tipusRelacio: 'Dependencia (el calcul s agrega per classificacio)' },
    ],
  },
};

async function seed(): Promise<void> {
  const municipalityRef = db.collection('municipis').doc(slug);
  const batch = db.batch();

  batch.set(municipalityRef, {
    exists: true,
    nom: 'Veciana',
    tipus: 'Ajuntament',
    provincia: 'Barcelona',
    poblacioReferencia: 40000,
    entorn: 'prova',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  for (const [page, payload] of Object.entries(pages)) {
    batch.set(municipalityRef.collection('pages').doc(page), { payload });
  }

  await batch.commit();
  console.log(`Seed completed: ${slug} (${Object.keys(pages).length} pages)`);
}

seed().catch((error: unknown) => {
  console.error('Unable to seed Veciana:', error);
  process.exitCode = 1;
});