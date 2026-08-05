/** Utilitats compartides per generar dades falses versemblants (botó "Fake data"). */

const PARAULES = [
  'dada', 'sistema', 'procés', 'gestió', 'usuari', 'municipi', 'servei', 'expedient', 'tràmit',
  'padró', 'registre', 'document', 'entitat', 'atribut', 'qualitat', 'seguretat', 'privacitat',
  'governança', 'catàleg', 'model', 'referència', 'auditoria', 'control', 'polítiques',
  'procediment', 'responsable', 'departament', 'ciutadà', 'validació', 'integració',
];

const NOMS = ['Marc', 'Anna', 'Jordi', 'Laia', 'Pau', 'Marta', 'Oriol', 'Núria', 'Pol', 'Clara', 'Àlex', 'Judit'];
const COGNOMS = ['Puig', 'Serra', 'Vidal', 'Ferrer', 'Roca', 'Soler', 'Vila', 'Bosch', 'Prat', 'Costa'];
const UNITATS = [
  'Secretaria General', 'Informàtica', 'Recursos Humans', 'Serveis Socials',
  'Intervenció', 'Urbanisme', 'Alcaldia', 'Estadística',
];

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom<T>(options: readonly T[]): T {
  return options[randomInt(0, options.length - 1)];
}

export function randomBool(): boolean {
  return Math.random() < 0.5;
}

export function randomYesNo(): 'SI' | 'NO' {
  return randomBool() ? 'SI' : 'NO';
}

/** Genera una frase curta capitalitzada, útil per a camps de descripció/comentaris. */
export function randomWords(minWords = 3, maxWords = 8): string {
  const count = randomInt(minWords, maxWords);
  const words = Array.from({ length: count }, () => randomFrom(PARAULES));
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function randomName(): string {
  return `${randomFrom(NOMS)} ${randomFrom(COGNOMS)}`;
}

export function randomEmail(name?: string): string {
  const base = (name ?? randomName()).toLocaleLowerCase('ca').replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${base}@diba.cat`;
}

export function randomUnitat(): string {
  return randomFrom(UNITATS);
}

export function randomCode(prefix: string, min = 1, max = 999): string {
  return `${prefix}-${randomInt(min, max)}`;
}

/** Omple només els camps buits ('' o null/undefined) de cada element amb un valor generat pel filler corresponent. */
export function fillEmptyFields<T extends Record<string, any>>(
  items: T[],
  fillers: { [K in keyof T]?: () => T[K] },
): void {
  for (const item of items) {
    for (const key of Object.keys(fillers) as (keyof T)[]) {
      if (item[key] === '' || item[key] === null || item[key] === undefined) {
        item[key] = fillers[key]!();
      }
    }
  }
}
