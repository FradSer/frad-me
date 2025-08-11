import React, { Component, ReactNode } from 'react'
import { webxrErrorLogger } from '@/utils/errorLogger'

interface WebXR3DErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface WebXR3DErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class WebXR3DErrorBoundary extends Component<WebXR3DErrorBoundaryProps, WebXR3DErrorBoundaryState> {
  constructor(props: WebXR3DErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<WebXR3DErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = 'Unknown3DComponent' } = this.props
    
    this.setState({ errorInfo })
    
    // Enhanced error logging with 3D context
    const enhancedError = new Error(`3D Component Error in ${componentName}: ${error.message}`)
    enhancedError.stack = error.stack
    
    console.error(`[WebXR 3D Error Boundary - ${componentName}]`, error, errorInfo)
    
    // Log to external service
    this.handleErrorLogging(enhancedError, errorInfo)
    
    // Call parent error handler
    this.props.onError?.(error, errorInfo)
  }

  private async handleErrorLogging(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    try {
      await webxrErrorLogger.logError(error, errorInfo)
    } catch (loggingError) {
      console.warn('Failed to log 3D component error:', loggingError)
    }
  }

  private renderDefaultFallback(): ReactNode {
    const { componentName = 'Component' } = this.props
    return null // Return null for 3D components to not break the scene
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderDefaultFallback()
    }

    return this.props.children
  }
}

export default WebXR3DErrorBoundary