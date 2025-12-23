import DOMPurify from 'dompurify';

/**
 * Sanitizes arbitrary HTML for safe rendering via dangerouslySetInnerHTML.
 *
 * Note: Do not pass non-HTML values here; they will be treated as empty.
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } });
}

