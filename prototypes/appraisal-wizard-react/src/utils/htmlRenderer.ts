/**
 * HTML Rendering Utilities
 * 
 * Safely renders formatted content with allowed HTML tags for the report preview.
 * Used to display AI-generated content and narrative text with proper formatting.
 */

// List of allowed HTML tags for sanitization
const ALLOWED_TAGS = [
  'b', 'strong',
  'i', 'em',
  'u',
  'br',
  'p',
  'span',
  'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote',
];

/**
 * Sanitizes HTML content by escaping all tags first, then restoring only allowed tags.
 * This provides XSS protection while allowing basic formatting.
 * 
 * @param content - The raw content string that may contain HTML
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(content: string): string {
  if (!content) return '';
  
  // First, escape all HTML entities
  let sanitized = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Restore allowed opening tags
  ALLOWED_TAGS.forEach(tag => {
    // Opening tag without attributes
    sanitized = sanitized.replace(
      new RegExp(`&lt;${tag}&gt;`, 'gi'),
      `<${tag}>`
    );
    // Self-closing tag (like <br/>)
    sanitized = sanitized.replace(
      new RegExp(`&lt;${tag}\\s*/?&gt;`, 'gi'),
      `<${tag}/>`
    );
    // Closing tag
    sanitized = sanitized.replace(
      new RegExp(`&lt;/${tag}&gt;`, 'gi'),
      `</${tag}>`
    );
  });
  
  // Convert newlines to <br/> tags
  sanitized = sanitized.replace(/\n/g, '<br/>');
  
  return sanitized;
}

/**
 * Checks if content contains HTML tags
 */
export function hasHtmlContent(content: string): boolean {
  if (!content) return false;
  return /<[^>]+>/.test(content);
}

/**
 * Converts plain text with newlines to HTML paragraphs
 */
export function textToParagraphs(content: string): string {
  if (!content) return '';
  
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  if (paragraphs.length === 1) {
    // Single paragraph - just convert single newlines to <br>
    return content.replace(/\n/g, '<br/>');
  }
  
  // Multiple paragraphs - wrap in <p> tags
  return paragraphs
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

/**
 * Renders content for report preview - handles both HTML and plain text
 */
export function renderReportContent(content: string): string {
  if (!content) return '';
  
  // If content already has HTML tags, sanitize and return
  if (hasHtmlContent(content)) {
    return sanitizeHtml(content);
  }
  
  // Plain text - convert newlines to breaks
  return content.replace(/\n/g, '<br/>');
}
