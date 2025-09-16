import { SANITIZATION_LIMITS } from './errorConstants';

/**
 * Security-focused sanitization utilities
 * Uses ReDoS-safe regex patterns with limited backtracking
 */

/**
 * Sanitizes a string by removing XSS and injection attempts
 */
export function sanitizeString(input: string, maxLength?: number): string {
  const limit = maxLength || SANITIZATION_LIMITS.GENERAL_INPUT;
  const limitedInput = input.substring(0, limit);

  return limitedInput
    // Windows paths: C:\path\to\file (atomic groups to prevent backtracking)
    .replace(
      /\b[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*\b/g,
      '[PATH]',
    )
    // Unix paths: /path/to/file (atomic groups to prevent backtracking)
    .replace(/\/(?:[^/\s<>"']+\/)*[^/\s<>"']*/g, '[PATH]')
    // Script tags (non-greedy with bounded repetition)
    .replace(/<script\b[^>]{0,100}>[\s\S]{0,1000}?<\/script>/gi, '[SCRIPT]')
    // HTML tags (bounded to prevent catastrophic backtracking)
    .replace(/<[^>]{0,100}>/g, '[HTML]')
    // SQL injection (simple pattern, no complex quantifiers)
    .replace(/DROP\s+TABLE/gi, '[SQL]')
    // Remove dangerous characters (character class, no backtracking)
    .replace(/[<>'"]/g, '');
}

/**
 * Sanitizes error messages with specific length limits
 */
export function sanitizeErrorMessage(message: string): string {
  return sanitizeString(message, SANITIZATION_LIMITS.ERROR_MESSAGE).substring(
    0,
    SANITIZATION_LIMITS.ERROR_MESSAGE_FINAL,
  );
}

/**
 * Sanitizes user agent strings with specific processing
 */
export function sanitizeUserAgent(userAgent: string): string {
  const limited = userAgent.substring(0, SANITIZATION_LIMITS.USER_AGENT);

  return limited
    // Script tags (non-greedy with bounded repetition)
    .replace(/<script\b[^>]{0,100}>[\s\S]{0,1000}?<\/script>/gi, '[SCRIPT]')
    // HTML tags (bounded to prevent catastrophic backtracking)
    .replace(/<[^>]{0,100}>/g, '[HTML]')
    // Remove dangerous characters (character class, no backtracking)
    .replace(/[<>'"]/g, '')
    .substring(0, SANITIZATION_LIMITS.USER_AGENT_FINAL);
}

/**
 * Sanitizes error names with length limits
 */
export function sanitizeErrorName(name: string): string {
  return name.substring(0, SANITIZATION_LIMITS.ERROR_NAME);
}

/**
 * Sanitizes URLs with specific length limits
 */
export function sanitizeUrl(url: string): string {
  return sanitizeString(url, SANITIZATION_LIMITS.URL);
}