import { NextRequest, NextResponse } from 'next/server'

/**
 * Structure for error information sent from the client
 */
interface ClientErrorInfo {
  readonly name: string
  readonly message: string
  readonly stack?: string
}

/**
 * Complete error payload structure from client
 */
interface ErrorPayload {
  readonly error: ClientErrorInfo
  readonly userAgent?: string
  readonly timestamp: string
  readonly url?: string
  readonly webxrSupported?: boolean
  readonly webglSupported?: boolean
}

/**
 * Sanitized error payload for logging (removes sensitive information)
 */
interface SanitizedErrorPayload {
  readonly error: {
    readonly name: string
    readonly message: string
    // Stack traces intentionally omitted for security
  }
  readonly userAgent?: string
  readonly timestamp: string
  readonly url?: string
  readonly webxrSupported?: boolean
  readonly webglSupported?: boolean
}

/**
 * Rate limiting data structure for tracking client requests
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory rate limit store (in production, use Redis or similar)
 */
interface RateLimitStore {
  [ip: string]: RateLimitEntry
}

/**
 * Type guard to validate unknown payload as ErrorPayload
 */
function isValidErrorPayload(payload: unknown): payload is ErrorPayload {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const p = payload as Record<string, unknown>
  
  return (
    p.error !== null &&
    typeof p.error === 'object' &&
    typeof (p.error as Record<string, unknown>).name === 'string' &&
    typeof (p.error as Record<string, unknown>).message === 'string' &&
    typeof p.timestamp === 'string'
  )
}

const rateLimitStore: RateLimitStore = {}
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10

/**
 * Checks if a client IP has exceeded the rate limit
 * 
 * @param ip - Client IP address
 * @returns True if request is allowed, false if rate limited
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const clientData = rateLimitStore[ip]

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    }
    return true
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  clientData.count++
  return true
}

/**
 * Sanitizes error payload by removing sensitive information and enforcing limits
 * 
 * @param payload - Raw error payload from client
 * @returns Sanitized payload safe for logging
 */
function sanitizeErrorPayload(payload: ErrorPayload): SanitizedErrorPayload {
  return {
    error: {
      name: payload.error.name.substring(0, 100),
      message: payload.error.message.substring(0, 500),
      // Stack traces removed from API response to prevent information disclosure
    },
    userAgent: payload.userAgent?.substring(0, 200),
    timestamp: new Date().toISOString(), // Use server timestamp for security
    url: payload.url?.substring(0, 300),
    webxrSupported: payload.webxrSupported,
    webglSupported: payload.webglSupported
  }
}

/**
 * API route handler for error logging
 * Implements rate limiting and input sanitization for security
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') ||
                   'unknown'

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body: unknown = await request.json()
    
    if (!isValidErrorPayload(body)) {
      return NextResponse.json({ error: 'Invalid error payload' }, { status: 400 })
    }

    const sanitizedPayload = sanitizeErrorPayload(body)
    
    // Log the error securely - stack traces only logged server-side, never in API response
    console.error('[WebXR Error API]', {
      ...sanitizedPayload,
      clientIp,
      requestTime: new Date().toISOString(),
      // Stack trace logged securely server-side only for debugging
      serverSideStack: process.env.NODE_ENV === 'development' ? body.error.stack?.substring(0, 2000) : undefined
    })

    // In production, you might want to:
    // - Store in a secure logging service
    // - Send to monitoring systems
    // - Apply additional filtering

    return NextResponse.json({ status: 'logged' })
  } catch (error) {
    console.error('[WebXR Error API] Failed to process error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}