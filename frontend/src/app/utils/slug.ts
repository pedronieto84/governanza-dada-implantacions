/**
 * Converts a municipality display name to a URL/filesystem-safe slug.
 * e.g. "Premià de Dalt" → "premia-de-dalt"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[·l]/g, 'l')           // Catalan l·l → ll
    .replace(/[^a-z0-9\s-]/g, '')    // remove remaining non-alphanumeric
    .trim()
    .replace(/\s+/g, '-');           // spaces → hyphens
}
