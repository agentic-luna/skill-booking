/**
 * Email Normalization & RFC-compliant Format Validation Utility
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 * No uppercase letters allowed in processing.
 */
export function normalizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Validates whether given input string is a valid format email address.
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const clean = normalizeEmail(email);
  return EMAIL_REGEX.test(clean);
}
