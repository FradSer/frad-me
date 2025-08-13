import React, { Component, ReactNode } from 'react'

import { webxrErrorLogger } from '@/utils/errorLogger'

interface ActionButton {
  text: string
  onClick: () => void
  className: string
}

interface WebXRErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface WebXRErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class WebXRErrorBoundary extends Component<WebXRErrorBoundaryProps, WebXRErrorBoundaryState> {
  constructor(props: WebXRErrorBoundaryProps) {
    super(props)
    this.state = { 
      hasError: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<WebXRErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Handle logging and external error callback
    this.handleErrorLogging(error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private async handleErrorLogging(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    const logMessage = 'WebXR Error Boundary'
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

  private renderErrorFallback(): ReactNode {
    const { fallback } = this.props
    if (fallback) return fallback
    return this.renderHeroStyleError()
  }

  private renderHeroStyleError(): ReactNode {
    const { error } = this.state
    const isDevMode = process.env.NODE_ENV === 'development'

    const actionButtons: readonly ActionButton[] = [
      {
        text: 'Try Again',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        },
        className: 'bg-white text-black hover:bg-gray-200'
      },
      {
        text: 'Return to Main',
        onClick: () => {
          if (typeof window !== 'undefined') {
            const homeUrl = new URL('/', window.location.origin)
            window.location.href = homeUrl.toString()
          }
        },
        className: 'bg-gray-800 text-white hover:bg-gray-700 border border-white'
      }
    ] as const

    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-6">WebXR Experience Unavailable</h1>
          <div className="space-y-3 mb-6">
            {actionButtons.map(({ text, onClick, className }) => (
              <button
                key={text}
                className={`block w-full rounded px-6 py-3 font-medium transition-colors ${className}`}
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
    return this.state.hasError ? this.renderErrorFallback() : this.props.children
  }
}

export default WebXRErrorBoundary