/**
 * Converts a string into a URL-friendly slug.
 * @param text The text to convert into a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single hyphen
} 