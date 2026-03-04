/**
 * Catàleg de referència de programari municipal.
 * Cada entrada mapeja el nom curt del programa al nom de l'empresa proveïdora.
 */
export const SOFTWARE_CATALOG: { nomCurt: string; proveidor: string }[] = [
  { nomCurt: 'Audifilm / AL_G_A',            proveidor: 'Berger-Levrault' },
  { nomCurt: 'SICAL / TAO',                  proveidor: 'T-Systems' },
  { nomCurt: 'Gestiona',                      proveidor: 'EsPúblico' },
  { nomCurt: 'Savilla / Ginpix7',            proveidor: 'Savia' },
  { nomCurt: 'Rosmiman',                      proveidor: 'Rosmiman Software Corporation' },
  { nomCurt: 'Mejoras Energéticas',          proveidor: 'Grupo FCC' },
  { nomCurt: 'Aytos / SicalWin',             proveidor: 'Berger-Levrault' },
  { nomCurt: 'Modulo Informatica / WinLocal', proveidor: 'Modulo Informatica' },
  { nomCurt: 'Efial',                         proveidor: 'Consultoría y Gestión Local' },
  { nomCurt: 'Nexus Geographics',            proveidor: 'Nexus Geographics' },
  { nomCurt: 'AbsysNet',                     proveidor: 'Baratz' },
  { nomCurt: 'Vortal',                        proveidor: 'Vortal' },
  { nomCurt: 'Spai',                          proveidor: 'Spai Innova' },
  { nomCurt: 'ATM Mediatraffic',             proveidor: 'ATM' },
  { nomCurt: 'CST / DRAG',                   proveidor: 'Seidor' },
];

/**
 * Llista de noms curts dels programes per als desplegables.
 */
export const NOM_CURT_OPTIONS: string[] = SOFTWARE_CATALOG.map(s => s.nomCurt);

/**
 * Llista única de proveïdors per als desplegables.
 */
export const PROVEIDOR_OPTIONS: string[] = [
  ...new Set(SOFTWARE_CATALOG.map(s => s.proveidor))
];

/**
 * Tipus de programari habituals per als municipis de la Diputació de Barcelona.
 */
export const TIPUS_SOFTWARE_OPTIONS: string[] = [
  'Gestió tributària i recaptació',
  'Comptabilitat i pressupost',
  'Gestió de recursos humans i nòmines',
  'Registre general d\'entrada i sortida',
  'Gestió d\'expedients i tramitació electrònica',
  'Padró municipal d\'habitants',
  'Gestió d\'urbanisme i llicències',
  'Gestió de manteniment d\'infraestructures',
  'Gestió energètica i medi ambient',
  'Sistemes d\'informació geogràfica (SIG/GIS)',
  'Gestió de biblioteques',
  'Contractació pública i compres',
  'Portal de transparència i govern obert',
  'Gestió de cementiri',
  'Gestió de multes i sancions',
  'Gestió de subvencions',
  'Atenció ciutadana (CRM)',
  'Gestió d\'inventari i patrimoni',
];
