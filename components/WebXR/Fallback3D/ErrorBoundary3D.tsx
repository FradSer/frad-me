import React, { Component, ReactNode } from 'react'

interface ErrorBoundary3DState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundary3DProps {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorBoundary3D extends Component<
  ErrorBoundary3DProps,
  ErrorBoundary3DState
> {
  constructor(props: ErrorBoundary3DProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundary3DState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Component Error:', error, errorInfo)

    // Check if it's a WebXR polyfill error
    if (
      error.message.includes('trim') ||
      error.stack?.includes('webxr-polyfill')
    ) {
      console.warn(
        'WebXR polyfill conflict detected, falling back to safe mode',
      )
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">3D Component Error</h3>
            <p className="mb-4 text-sm text-gray-300">
              There was an issue loading the 3D content.
            </p>
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
              }}
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

export default ErrorBoundary3D
