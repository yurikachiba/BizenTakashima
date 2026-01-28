/**
 * Server-side content sanitizer for XSS prevention.
 * Removes dangerous patterns while preserving safe HTML content.
 */

// Patterns that are dangerous and should be removed
const DANGEROUS_PATTERNS = [
  // Script tags and content
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  // Event handlers (onclick, onerror, onload, etc.)
  /\s+on\w+\s*=\s*["'][^"']*["']/gi,
  /\s+on\w+\s*=\s*[^\s>]+/gi,
  // Javascript URLs
  /javascript\s*:/gi,
  // Data URLs with javascript
  /data\s*:\s*text\/html/gi,
  // VBScript (for legacy IE)
  /vbscript\s*:/gi,
  // Expression (CSS expression for IE)
  /expression\s*\(/gi,
];

// Dangerous tags that should be removed entirely
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form'];

/**
 * Sanitizes content by removing dangerous HTML patterns.
 * This is a lightweight server-side sanitizer that preserves safe HTML
 * while removing scripts, event handlers, and other XSS vectors.
 *
 * @param input - The raw content string
 * @returns Sanitized content string
 */
export function sanitizeContent(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove dangerous tags
  for (const tag of DANGEROUS_TAGS) {
    const openTagPattern = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    const closeTagPattern = new RegExp(`</${tag}>`, 'gi');
    sanitized = sanitized.replace(openTagPattern, '');
    sanitized = sanitized.replace(closeTagPattern, '');
  }

  return sanitized;
}

/**
 * Checks if content contains potentially dangerous patterns.
 * Useful for logging or alerting without modifying content.
 *
 * @param input - The content string to check
 * @returns true if dangerous patterns are detected
 */
export function hasDangerousContent(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    // Reset lastIndex to 0 before each test to avoid issues with global flag
    // Without this, the regex may start searching from a previous match position
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      return true;
    }
  }

  for (const tag of DANGEROUS_TAGS) {
    const tagPattern = new RegExp(`<${tag}\\b`, 'i');
    if (tagPattern.test(input)) {
      return true;
    }
  }

  return false;
}
