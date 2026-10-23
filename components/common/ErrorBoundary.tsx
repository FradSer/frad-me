'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

function FullPageFallback() {
  return (
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
  );
}

function ComponentFallback({ componentName, error }: { componentName: string; error?: Error }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <p className="text-sm text-red-600 dark:text-red-400">Component error in {componentName}</p>
      {error && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-500">Error details</summary>
          <pre className="mt-1 whitespace-pre-wrap text-xs text-red-400">{error.message}</pre>
        </details>
      )}
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const logPrefix = this.props.componentName
      ? `[${this.props.componentName}]`
      : '[ErrorBoundary]';
    console.error(logPrefix, error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, componentName } = this.props;

    if (!hasError) return children;

    if (componentName) {
      return <ComponentFallback componentName={componentName} error={error} />;
    }

    return <FullPageFallback />;
  }
}

export default ErrorBoundary;
