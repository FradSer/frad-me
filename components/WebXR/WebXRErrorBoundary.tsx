import React, { Component, ReactNode } from 'react'

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
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): WebXRErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only set errorInfo since error is already set by getDerivedStateFromError
    this.setState({ errorInfo })

    console.error('WebXR Error Boundary caught an error:', error, errorInfo)
    
    this.props.onError?.(error, errorInfo)
    this.logToAnalytics(error)
  }

  private logToAnalytics(error: Error) {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'exception', {
        description: `WebXR Error: ${error.message}`,
        fatal: false
      })
    }
  }

  private renderErrorFallback() {
    const { error, errorInfo } = this.state
    const isDevMode = process.env.NODE_ENV === 'development'

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">WebXR Experience Unavailable</h1>
          <p className="mb-6 text-gray-300">
            We encountered an issue loading the 3D experience. This might be due to:
            <br />
            • Unsupported device or browser
            <br />
            • WebGL/WebXR not available
            <br />
            • Graphics hardware limitations
          </p>
          <div className="space-y-3">
            <button
              className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button
              className="w-full rounded bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
              onClick={() => (window.location.href = '/')}
            >
              Return to Main Site
            </button>
          </div>
          {isDevMode && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-400">
                Error Details (Development)
              </summary>
              <pre className="mt-2 overflow-auto bg-gray-800 p-2 text-xs text-red-300">
                {error.toString()}
                {errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorFallback()
    }
    return this.props.children
  }
}

export default WebXRErrorBoundary