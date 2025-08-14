import React, { ReactNode, ErrorInfo } from 'react'
import { BaseErrorBoundary, BaseErrorBoundaryProps, BaseErrorBoundaryState } from './shared/BaseErrorBoundary'

interface WebXR3DErrorBoundaryProps extends BaseErrorBoundaryProps {
  componentName?: string
}

class WebXR3DErrorBoundary extends BaseErrorBoundary<WebXR3DErrorBoundaryProps, BaseErrorBoundaryState> {
  protected getInitialState(): BaseErrorBoundaryState {
    return { hasError: false }
  }

  protected handleCustomErrorLogic(error: Error, errorInfo: ErrorInfo): void {
    const { componentName = 'Unknown3DComponent' } = this.props
    
    // Enhanced error logging with 3D context
    const enhancedError = new Error(`3D Component Error in ${componentName}: ${error.message}`)
    enhancedError.stack = error.stack
    
    // Additional logging specific to 3D components
    console.error(`[WebXR 3D Error Boundary - ${componentName}]`, error, errorInfo)
  }

  protected renderFallback(): ReactNode {
    // Return null for 3D components to not break the scene
    return null
  }
}

export default WebXR3DErrorBoundary