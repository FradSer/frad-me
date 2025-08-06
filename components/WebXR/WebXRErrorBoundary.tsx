import React, { Component, ReactNode } from 'react'

import WebXR3DFallback from './WebXR3DFallback'
import { webxrErrorLogger } from '@/utils/errorLogger'

type FallbackLevel = 'webxr' | '3d' | 'error'

interface ActionButton {
  text: string
  onClick: () => void
  className: string
}

interface WebXRErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  fallbackLevel: FallbackLevel
  retryCount: number
}

interface WebXRErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  initialLevel?: FallbackLevel
  enableAutoFallback?: boolean
  maxRetries?: number
}

// Configuration for fallback progression
const FALLBACK_PROGRESSION: Record<FallbackLevel, FallbackLevel | null> = {
  webxr: '3d',
  '3d': 'error',
  'error': null
}

class WebXRErrorBoundary extends Component<WebXRErrorBoundaryProps, WebXRErrorBoundaryState> {
  constructor(props: WebXRErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      fallbackLevel: props.initialLevel || 'webxr',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<WebXRErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { enableAutoFallback = true, maxRetries = 2 } = this.props
    
    // Determine new fallback level based on retry count and auto-fallback setting
    const shouldFallback = enableAutoFallback && this.state.retryCount < maxRetries
    const nextLevel = shouldFallback ? FALLBACK_PROGRESSION[this.state.fallbackLevel] : null
    
    this.setState(prevState => ({
      errorInfo,
      fallbackLevel: nextLevel || prevState.fallbackLevel,
      retryCount: prevState.retryCount + 1
    }))
    
    // Handle logging and external error callback
    this.handleErrorLogging(error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private async handleErrorLogging(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    const logMessage = `WebXR Error Boundary (${this.state.fallbackLevel})`
    console.error(logMessage, error, errorInfo)
    
    try {
      await webxrErrorLogger.logError(error, errorInfo)
    } catch (loggingError) {
      console.warn('Failed to log error:', loggingError)
    }
  }

  private sanitizeError(error: Error): string {
    const sanitizedMessage = error.message.replace(/\/[^\s]+/g, '[PATH]')
    return `${error.name}: ${sanitizedMessage}`
  }

  private resetErrorState = (overrides: Partial<WebXRErrorBoundaryState> = {}) => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      fallbackLevel: prevState.fallbackLevel,
      retryCount: prevState.retryCount,
      ...overrides
    }))
  }

  private handleRetry = () => {
    this.resetErrorState({ retryCount: this.state.retryCount + 1 })
  }

  private handleFallbackLevelChange = (level: FallbackLevel) => {
    this.resetErrorState({ fallbackLevel: level, retryCount: 0 })
  }

  private renderFallbackByLevel(): ReactNode {
    const { fallbackLevel, retryCount } = this.state
    const { maxRetries = 2, fallback } = this.props

    if (fallback) return fallback

    const fallbackComponents = {
      '3d': () => retryCount <= maxRetries ? (
        <WebXR3DFallback 
          onError={(err) => this.componentDidCatch(err, { componentStack: '' })}
        />
      ) : this.renderErrorFallback(),
      'error': () => this.renderErrorFallback(),
      'webxr': () => this.renderErrorFallback()
    }

    return fallbackComponents[fallbackLevel]?.() || this.renderErrorFallback()
  }

  private renderErrorFallback(): ReactNode {
    const { error } = this.state
    const isDevMode = process.env.NODE_ENV === 'development'
    
    const errorReasons: readonly string[] = [
      'Unsupported device or browser',
      'WebGL/WebXR not available', 
      'Graphics hardware limitations'
    ] as const

    const actionButtons: readonly ActionButton[] = [
      {
        text: 'Try Again',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        },
        className: 'bg-blue-600 hover:bg-blue-700'
      },
      {
        text: 'Return to Main Site',
        onClick: () => {
          if (typeof window !== 'undefined') {
            const homeUrl = new URL('/', window.location.origin)
            window.location.href = homeUrl.toString()
          }
        },
        className: 'bg-gray-700 hover:bg-gray-600'
      }
    ] as const

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">WebXR Experience Unavailable</h1>
          <p className="mb-6 text-gray-300">
            We encountered an issue loading the 3D experience. This might be due to:
            {errorReasons.map(reason => (
              <React.Fragment key={reason}>
                <br />• {reason}
              </React.Fragment>
            ))}
          </p>
          <div className="space-y-3">
            {actionButtons.map(({ text, onClick, className }) => (
              <button
                key={text}
                className={`w-full rounded px-4 py-2 font-medium text-white ${className}`}
                onClick={onClick}
              >
                {text}
              </button>
            ))}
          </div>
          {isDevMode && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-400">
                Error Details (Development)
              </summary>
              <pre className="mt-2 overflow-auto bg-gray-800 p-2 text-xs text-red-300">
                {this.sanitizeError(error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  render() {
    return this.state.hasError ? this.renderFallbackByLevel() : this.props.children
  }
}

export default WebXRErrorBoundary