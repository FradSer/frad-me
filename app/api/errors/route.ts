import { type NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/utils/rateLimiter';

/**
 * Unified error data structure with optional fields
 */
interface ErrorData {
  readonly error: {
    name: string;
    message: string;
    stack?: string;
  };
  readonly userAgent?: string;
  readonly timestamp: string;
  readonly url?: string;
  readonly webxrSupported?: boolean;
  readonly webglSupported?: boolean;
}

/**
 * Sanitized error data (omits sensitive stack trace)
 */
type SanitizedErrorData = Omit<ErrorData, 'error'> & {
  error: Omit<ErrorData['error'], 'stack'>;
};

/**
 * Simplified type guard to validate error data
 */
function isValidErrorData(data: unknown): data is ErrorData {
  const error = (data as any)?.error;
  return error?.name && error?.message && (data as any)?.timestamp;
}

// Create rate limiter instance
const rateLimiter = createRateLimiter({
  window: 15 * 60 * 1000, // 15 minutes
  max: 10,
});

/**
 * Sanitizes a string by removing XSS and injection attempts
 * Uses ReDoS-safe regex patterns with limited backtracking
 */
function sanitizeString(input: string): string {
  // Limit input length to prevent DoS
  const limitedInput = input.substring(0, 2000);

  return (
    limitedInput
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
      .replace(/[<>'"]/g, '')
  );
}

/**
 * Sanitizes error data by removing sensitive information and enforcing limits
 *
 * @param data - Raw error data from client
 * @returns Sanitized data safe for logging
 */
function sanitizeErrorData(data: ErrorData): SanitizedErrorData {
  return {
    error: {
      name: sanitizeString(data.error.name).substring(0, 100),
      message: sanitizeString(data.error.message).substring(0, 500),
      // Stack traces removed from API response to prevent information disclosure
    },
    userAgent: sanitizeString(data.userAgent || '').substring(0, 200),
    timestamp: new Date().toISOString(), // Use server timestamp for security
    url: sanitizeString(data.url || '').substring(0, 300),
    webxrSupported: data.webxrSupported,
    webglSupported: data.webglSupported,
  };
}

/**
 * API route handler for error logging
 * Implements rate limiting and input sanitization for security
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!rateLimiter.check(clientIp)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body: unknown = await request.json();

    if (!isValidErrorData(body)) {
      return NextResponse.json(
        { error: 'Invalid error payload' },
        { status: 400 },
      );
    }

    const sanitizedData = sanitizeErrorData(body);

    // Log the error securely - stack traces only logged server-side, never in API response
    console.error('[WebXR Error API]', {
      ...sanitizedData,
      clientIp,
      requestTime: new Date().toISOString(),
      // Stack trace logged securely server-side only for debugging
      serverSideStack:
        process.env.NODE_ENV === 'development'
          ? body.error.stack?.substring(0, 2000)
          : undefined,
    });

    // In production, you might want to:
    // - Store in a secure logging service
    // - Send to monitoring systems
    // - Apply additional filtering

    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('[WebXR Error API] Failed to process error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
