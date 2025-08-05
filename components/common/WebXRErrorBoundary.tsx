import React, { Component, ErrorInfo, ReactNode } from 'react'

interface WebXRErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface WebXRErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class WebXRErrorBoundary extends Component<WebXRErrorBoundaryProps, WebXRErrorBoundaryState> {
  constructor(props: WebXRErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): WebXRErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebXR component failed:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Unable to load 3D experience</h2>
            <p className="text-gray-300 mb-6">
              The WebXR components failed to load. Please try again.
            </p>
            
            <button 
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default WebXRErrorBoundary