import React, { Component, ReactNode, ErrorInfo } from 'react'
import { webxrErrorLogger } from '@/utils/errorLogger'

// Base error boundary state interface
export interface BaseErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

// Base error boundary props interface
export interface BaseErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  componentName?: string
  enableLogging?: boolean
}

// Shared error logging functionality
export const handleErrorLogging = async (
  error: Error, 
  errorInfo: ErrorInfo, 
  componentName?: string,
  enableLogging = true
): Promise<void> => {
  const logContext = componentName ? `[${componentName}]` : '[WebXR Error Boundary]'
  console.error(logContext, error, errorInfo)
  
  if (enableLogging) {
    try {
      await webxrErrorLogger.logError(error, errorInfo)
    } catch (loggingError) {
      console.warn(`Failed to log error from ${componentName}:`, loggingError)
    }
  }
}

// Shared error sanitization
export const sanitizeError = (error: Error): string => {
  const sanitizedMessage = error.message.replace(/\/[^\s]+/g, '[PATH]')
  return `${error.name}: ${sanitizedMessage}`
}

// Abstract base class for error boundaries
export abstract class BaseErrorBoundary<
  TProps extends BaseErrorBoundaryProps = BaseErrorBoundaryProps,
  TState extends BaseErrorBoundaryState = BaseErrorBoundaryState
> extends Component<TProps, TState> {
  
  constructor(props: TProps) {
    super(props)
    this.state = this.getInitialState()
  }

  // Abstract method for initial state - allows customization per implementation
  protected abstract getInitialState(): TState

  // Standardized error derivation
  static getDerivedStateFromError(error: Error): Partial<BaseErrorBoundaryState> {
    return { hasError: true, error }
  }

  // Template method pattern - allows customization of error handling logic
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError, enableLogging = true } = this.props
    
    // Update state with error info - use setState with function to properly type
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    } as TState))
    
    // Handle error logging
    this.handleLogging(error, errorInfo, componentName, enableLogging)
    
    // Call custom error handling
    this.handleCustomErrorLogic(error, errorInfo)
    
    // Call parent error handler
    onError?.(error, errorInfo)
  }

  // Default logging implementation - can be overridden
  protected async handleLogging(
    error: Error, 
    errorInfo: ErrorInfo, 
    componentName?: string,
    enableLogging = true
  ): Promise<void> {
    await handleErrorLogging(error, errorInfo, componentName, enableLogging)
  }

  // Hook for custom error handling logic - can be overridden
  protected handleCustomErrorLogic(error: Error, errorInfo: ErrorInfo): void {
    // Default implementation does nothing - override for custom logic
  }

  // Template method for retry functionality
  protected resetErrorState(overrides: Partial<TState> = {}): void {
    this.setState(prevState => ({
      ...prevState,
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      ...overrides
    }))
  }

  // Template method for fallback rendering - can be overridden
  protected abstract renderFallback(): ReactNode

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderFallback()
    }

    return this.props.children
  }
}

// Utility HOC for wrapping components with error boundaries
export const withErrorBoundary = <TProps extends object>(
  WrappedComponent: React.ComponentType<TProps>,
  errorBoundaryProps: Partial<BaseErrorBoundaryProps> = {}
) => {
  return class WithErrorBoundary extends BaseErrorBoundary {
    protected getInitialState(): BaseErrorBoundaryState {
      return { hasError: false }
    }

    protected renderFallback(): ReactNode {
      return (
        <div className="text-red-500">
          Component failed to load: {this.state.error?.message}
        </div>
      )
    }

    render() {
      if (this.state.hasError) {
        return this.renderFallback()
      }

      return <WrappedComponent {...(this.props as TProps)} />
    }
  }
}

export default BaseErrorBoundary