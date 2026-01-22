'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

// Simplified error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Common error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
  enableLogging?: boolean;
}

// Default fallback UI configurations
const fallbackConfigs = {
  default: (_error?: Error) => (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  ),
  webxr: (error?: Error) => (
    <div className="flex h-full w-full items-center justify-center bg-black text-white">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">WebXR Error</h3>
        <p className="mb-4 text-sm text-gray-300">
          Unable to load WebXR experience. Falling back to 2D view.
        </p>
        <p className="text-xs text-gray-400">{error?.message || 'Unknown WebXR error'}</p>
      </div>
    </div>
  ),
  component: (error?: Error, componentName?: string) => (
    <div className="rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <p className="text-sm text-red-600 dark:text-red-400">
        Component error{componentName ? ` in ${componentName}` : ''}
      </p>
      {error && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-500">Error details</summary>
          <pre className="mt-1 whitespace-pre-wrap text-xs text-red-400">{error.message}</pre>
        </details>
      )}
    </div>
  ),
} as const;

/**
 * Reusable error boundary with multiple fallback modes
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError, enableLogging = true } = this.props;

    // Update state with error info
    this.setState((prevState) => ({
      ...prevState,
      errorInfo,
    }));

    // Log to console
    const logPrefix = componentName ? `[${componentName}]` : '[ErrorBoundary]';
    if (enableLogging) {
      console.error(logPrefix, error, errorInfo);
    }

    // Call custom error handler
    onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use appropriate default fallback based on component name
      const { componentName } = this.props;
      const { error } = this.state;

      if (componentName?.includes('WebXR') || componentName?.includes('3D')) {
        return fallbackConfigs.webxr(error);
      }

      if (componentName) {
        return fallbackConfigs.component(error, componentName);
      }

      return fallbackConfigs.default(error);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
