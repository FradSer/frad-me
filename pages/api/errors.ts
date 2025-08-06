import type { NextApiRequest, NextApiResponse } from 'next'

interface ErrorPayload {
  error: {
    name: string
    message: string
    stack?: string
  }
  userAgent?: string
  timestamp: string
  url?: string
  webxrSupported?: boolean
  webglSupported?: boolean
}

interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10

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

function validateErrorPayload(payload: any): payload is ErrorPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    payload.error &&
    typeof payload.error.name === 'string' &&
    typeof payload.error.message === 'string' &&
    typeof payload.timestamp === 'string'
  )
}

function sanitizeErrorPayload(payload: ErrorPayload): ErrorPayload {
  return {
    error: {
      name: payload.error.name.substring(0, 100),
      message: payload.error.message.substring(0, 500),
      stack: process.env.NODE_ENV === 'development' ? payload.error.stack?.substring(0, 2000) : undefined
    },
    userAgent: payload.userAgent?.substring(0, 200),
    timestamp: new Date().toISOString(), // Use server timestamp for security
    url: payload.url?.substring(0, 300),
    webxrSupported: payload.webxrSupported,
    webglSupported: payload.webglSupported
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                   (req.connection?.remoteAddress) || 
                   (req.socket?.remoteAddress) || 
                   'unknown'

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }

  if (!validateErrorPayload(req.body)) {
    return res.status(400).json({ error: 'Invalid error payload' })
  }

  try {
    const sanitizedPayload = sanitizeErrorPayload(req.body)
    
    // Log the error securely
    console.error('[WebXR Error API]', {
      ...sanitizedPayload,
      clientIp,
      requestTime: new Date().toISOString()
    })

    // In production, you might want to:
    // - Store in a secure logging service
    // - Send to monitoring systems
    // - Apply additional filtering

    res.status(200).json({ status: 'logged' })
  } catch (error) {
    console.error('[WebXR Error API] Failed to process error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}