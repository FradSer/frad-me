import React, { Component, ReactNode, ErrorInfo } from 'react'

import { ErrorFallback } from './shared/FallbackUI'
import { sanitizeError } from './shared/BaseErrorBoundary'
import { webxrErrorLogger } from '@/utils/errorLogger'
import { 
  FALLBACK_PROGRESSION, 
  FALLBACK_DEFAULTS, 
  type FallbackLevel 
} from '@/utils/webxr/fallbackConfig'

// Extended state for WebXR-specific error boundary
interface WebXRErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  fallbackLevel: FallbackLevel
  retryCount: number
}

// Extended props for WebXR-specific error boundary
interface WebXRErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  initialLevel?: FallbackLevel
  enableAutoFallback?: boolean
  maxRetries?: number
}

class WebXRErrorBoundary extends Component<WebXRErrorBoundaryProps, WebXRErrorBoundaryState> {
  constructor(props: WebXRErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false,
      fallbackLevel: props.initialLevel || FALLBACK_DEFAULTS.level,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<WebXRErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only update error info, don't change fallback level immediately
    this.setState(prevState => ({
      errorInfo,
      retryCount: prevState.retryCount + 1
    }))
    
    // Handle logging and external error callback
    this.handleErrorLogging(error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private async handleErrorLogging(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const logMessage = `WebXR Error Boundary (${this.state.fallbackLevel})`
    console.error(logMessage, error, errorInfo)
    
    try {
      await webxrErrorLogger.logError(error, errorInfo)
    } catch (loggingError) {
      console.warn('Failed to log error:', loggingError)
    }
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
    const { fallback } = this.props

    if (fallback) return fallback

    // Since fallback components were removed, always render the error fallback
    return this.renderErrorFallback()
  }

  private renderErrorFallback(): ReactNode {
    return (
      <ErrorFallback 
        error={this.state.error}
        sanitizeError={sanitizeError}
        onRetry={this.handleRetry}
        onGoHome={() => {
          if (typeof window !== 'undefined') {
            const homeUrl = new URL('/', window.location.origin)
            window.location.href = homeUrl.toString()
          }
        }}
      />
    )
  }

  render() {
    return this.state.hasError ? this.renderFallbackByLevel() : this.props.children
  }
}

export default WebXRErrorBoundary