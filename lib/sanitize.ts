// Server-side input sanitization helpers.
// Used in all forum API routes before writing to Sanity.

const VALID_CATEGORIES = new Set([
  'general',
  'openings',
  'tactics',
  'endgame',
  'app-feedback',
]);

const VALID_ID_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Strip null bytes and non-printable control characters (except \n and \t),
 * trim whitespace, and truncate to maxLength.
 * Returns null if the result is empty.
 */
function sanitizeText(input: unknown, maxLength: number): string | null {
  if (typeof input !== 'string') return null;
  const cleaned = input
    .replace(/\x00/g, '')                           // null bytes
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars (keep \n \t)
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

/** Question / answer title — 120 chars max. */
export function sanitizeTitle(input: unknown): string | null {
  return sanitizeText(input, 120);
}

/** Question or answer body — 5 000 chars max. */
export function sanitizeBody(input: unknown): string | null {
  return sanitizeText(input, 5_000);
}

/** Validate a forum category value against the known enum. */
export function isValidCategory(category: unknown): category is string {
  return typeof category === 'string' && VALID_CATEGORIES.has(category);
}

/** Validate a Sanity document ID (alphanumeric + hyphens/underscores). */
export function isValidDocumentId(id: unknown): id is string {
  return typeof id === 'string' && VALID_ID_RE.test(id);
}
