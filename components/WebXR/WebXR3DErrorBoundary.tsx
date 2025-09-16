'use client';

import { Component, type ErrorInfo, type ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { webxrErrorLogger } from '@/utils/errorLogger';

// Dynamic imports for progressive fallback components
const Fallback3DScene = dynamic(
  () => import('@/components/WebXR/Fallback3D/Scene'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
          <p className="text-sm">Loading 3D fallback...</p>
        </div>
      </div>
    )
  }
);

// Capability detection utilities
interface DeviceCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasWebXR: boolean;
  performanceLevel: 'low' | 'medium' | 'high';
}

const detectCapabilities = (): DeviceCapabilities => {
  const canvas = document.createElement('canvas');
  const webglContext = canvas.getContext('webgl');
  const webgl2Context = canvas.getContext('webgl2');

  const hasWebGL = !!webglContext;
  const hasWebGL2 = !!webgl2Context;

  // WebXR detection
  const hasWebXR = 'xr' in navigator && !!(navigator as any).xr;

  // Performance level detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator?.userAgent || ''
  );
  const deviceMemory = (navigator as any)?.deviceMemory || 4;
  const pixelRatio = window?.devicePixelRatio || 1;

  let performanceLevel: 'low' | 'medium' | 'high' = 'medium';

  if (isMobile && deviceMemory < 4) {
    performanceLevel = 'low';
  } else if (!isMobile && hasWebGL2 && pixelRatio > 1.5) {
    performanceLevel = 'high';
  }

  // Clean up canvas
  canvas.remove();

  return {
    hasWebGL,
    hasWebGL2,
    hasWebXR,
    performanceLevel
  };
};

// Circuit breaker for repeated failures
class FallbackCircuitBreaker {
  private failures: Map<string, number> = new Map();
  private readonly maxFailures = 3;
  private readonly resetTimeMs = 300000; // 5 minutes
  private readonly resetTimers: Map<string, NodeJS.Timeout> = new Map();

  isOpen(fallbackType: string): boolean {
    return (this.failures.get(fallbackType) || 0) >= this.maxFailures;
  }

  recordFailure(fallbackType: string): void {
    const currentFailures = this.failures.get(fallbackType) || 0;
    this.failures.set(fallbackType, currentFailures + 1);

    // Clear existing reset timer
    const existingTimer = this.resetTimers.get(fallbackType);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new reset timer
    const resetTimer = setTimeout(() => {
      this.failures.delete(fallbackType);
      this.resetTimers.delete(fallbackType);
    }, this.resetTimeMs);

    this.resetTimers.set(fallbackType, resetTimer);
  }

  reset(fallbackType?: string): void {
    if (fallbackType) {
      this.failures.delete(fallbackType);
      const timer = this.resetTimers.get(fallbackType);
      if (timer) {
        clearTimeout(timer);
        this.resetTimers.delete(fallbackType);
      }
    } else {
      this.failures.clear();
      this.resetTimers.forEach(timer => clearTimeout(timer));
      this.resetTimers.clear();
    }
  }
}

// Fallback progression types
type FallbackLevel = 'webxr' | 'fallback3d' | 'fallback2d' | 'final';

interface WebXR3DErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  fallbackLevel: FallbackLevel;
  capabilities?: DeviceCapabilities;
  retryCount: number;
}

interface WebXR3DErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, fallbackLevel: FallbackLevel) => void;
  enableLogging?: boolean;
  maxRetries?: number;
}

// Global circuit breaker instance
const circuitBreaker = new FallbackCircuitBreaker();

class WebXR3DErrorBoundary extends Component<
  WebXR3DErrorBoundaryProps,
  WebXR3DErrorBoundaryState
> {
  constructor(props: WebXR3DErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      fallbackLevel: 'webxr',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WebXR3DErrorBoundaryState> {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { enableLogging = true, onError, maxRetries = 2 } = this.props;

    // Detect device capabilities if not already done
    if (!this.state.capabilities) {
      const capabilities = detectCapabilities();
      this.setState({ capabilities });
    }

    // Determine next fallback level
    const nextFallbackLevel = this.determineNextFallback(error);

    // Update state with error info and next fallback
    this.setState(prevState => ({
      errorInfo,
      fallbackLevel: nextFallbackLevel,
      retryCount: prevState.retryCount + 1
    }));

    // Log error
    console.error(`[WebXR3DErrorBoundary] Error in ${this.state.fallbackLevel}:`, error, errorInfo);

    // Record failure in circuit breaker
    circuitBreaker.recordFailure(this.state.fallbackLevel);

    // Log to external service if enabled
    if (enableLogging) {
      try {
        await webxrErrorLogger.logError(error, {
          ...errorInfo,
          fallbackLevel: this.state.fallbackLevel,
          capabilities: this.state.capabilities,
          retryCount: this.state.retryCount
        });
      } catch (loggingError) {
        console.warn('Failed to log WebXR error:', loggingError);
      }
    }

    // Call custom error handler
    onError?.(error, errorInfo, nextFallbackLevel);
  }

  private determineNextFallback(error: Error): FallbackLevel {
    const { capabilities } = this.state;
    const currentLevel = this.state.fallbackLevel;

    // Progressive fallback logic
    switch (currentLevel) {
      case 'webxr':
        // WebXR failed, try 3D fallback if WebGL is available and circuit isn't open
        if (capabilities?.hasWebGL && !circuitBreaker.isOpen('fallback3d')) {
          return 'fallback3d';
        }
        return 'fallback2d';

      case 'fallback3d':
        // 3D fallback failed, fall back to 2D
        return 'fallback2d';

      case 'fallback2d':
        // 2D fallback failed, use final fallback
        return 'final';

      default:
        return 'final';
    }
  }

  private renderFallback(): ReactNode {
    const { fallbackLevel, error, capabilities } = this.state;

    switch (fallbackLevel) {
      case 'fallback3d':
        return (
          <div className="h-full w-full bg-black">
            <Suspense fallback={this.renderLoading()}>
              <Fallback3DScene />
            </Suspense>
          </div>
        );

      case 'fallback2d':
        return this.render2DFallback();

      case 'final':
        return this.renderFinalFallback();

      default:
        return this.render2DFallback();
    }
  }

  private renderLoading(): ReactNode {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-lg font-medium">Loading WebXR Experience...</p>
          <p className="text-sm text-gray-400 mt-2">
            Detecting device capabilities...
          </p>
        </div>
      </div>
    );
  }

  private render2DFallback(): ReactNode {
    const { error } = this.state;

    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="max-w-md text-center p-6">
          <div className="mb-6">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            3D Experience Unavailable
          </h2>

          <p className="mb-6 text-gray-600 dark:text-gray-400">
            WebXR and 3D rendering are not available on your device.
            Here are some options to continue:
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Try refreshing the page</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Use a WebXR-compatible browser</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Visit on a desktop device</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Refresh Page
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderFinalFallback(): ReactNode {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 dark:bg-red-900/10">
        <div className="max-w-md text-center p-6">
          <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
            Critical Error
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Multiple fallback systems have failed. Please try refreshing the page or contact support.
          </p>
          <button
            onClick={() => {
              circuitBreaker.reset();
              window.location.reload();
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Reset & Refresh
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

// Named export for component testing
export { WebXR3DErrorBoundary };

// Default export
export default WebXR3DErrorBoundary;