import { type NextRequest, NextResponse } from 'next/server';
import { API_RATE_LIMITS, SANITIZATION_LIMITS } from '@/utils/errorConstants';
import { createRateLimiter } from '@/utils/rateLimiter';
import {
  sanitizeErrorMessage,
  sanitizeErrorName,
  sanitizeUrl,
  sanitizeUserAgent,
} from '@/utils/sanitization';

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
  const dataObj = data as Record<string, unknown> | null | undefined;
  const error = dataObj?.error as Record<string, unknown> | null | undefined;
  return !!error?.name && !!error?.message && !!dataObj?.timestamp;
}

// Create rate limiter instance
const rateLimiter = createRateLimiter({
  window: API_RATE_LIMITS.WINDOW_MS,
  max: API_RATE_LIMITS.MAX_REQUESTS,
});

/**
 * Sanitizes error data by removing sensitive information and enforcing limits
 *
 * @param data - Raw error data from client
 * @returns Sanitized data safe for logging
 */
function sanitizeErrorData(data: ErrorData): SanitizedErrorData {
  return {
    error: {
      name: sanitizeErrorName(data.error.name),
      message: sanitizeErrorMessage(data.error.message),
      // Stack traces removed from API response to prevent information disclosure
    },
    userAgent: sanitizeUserAgent(data.userAgent || ''),
    timestamp: new Date().toISOString(), // Use server timestamp for security
    url: sanitizeUrl(data.url || ''),
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
      return NextResponse.json({ error: 'Invalid error payload' }, { status: 400 });
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
          ? body.error.stack?.substring(0, SANITIZATION_LIMITS.STACK_TRACE)
          : undefined,
    });

    // In production, you might want to:
    // - Store in a secure logging service
    // - Send to monitoring systems
    // - Apply additional filtering

    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('[WebXR Error API] Failed to process error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
