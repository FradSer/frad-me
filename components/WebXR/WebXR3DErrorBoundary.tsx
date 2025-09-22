'use client';

import { Component, type ErrorInfo, type ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { webxrErrorLogger } from '@/utils/errorLogger';
import { DeviceCapabilityService, type DeviceCapabilities } from '@/utils/services/DeviceCapabilityService';
import { CircuitBreakerService } from '@/utils/services/CircuitBreakerService';
import { LoadingSpinner, ErrorFallback } from '@/components/common/FallbackUI';

// Dynamic imports for progressive fallback components
const Fallback3DScene = dynamic(
  () => import('@/components/WebXR/Fallback3D/Scene'),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading 3D fallback..." />
  }
);



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
const circuitBreaker = new CircuitBreakerService();

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
    const capabilities = this.state.capabilities ?? DeviceCapabilityService.detectCapabilities();

    // Calculate next retry count
    const nextRetryCount = this.state.retryCount + 1;

    // Determine next fallback level using current state values
    const currentFallbackLevel = this.state.fallbackLevel;
    const nextFallbackLevel = this.determineNextFallback(error, capabilities, maxRetries, nextRetryCount, currentFallbackLevel);

    // Record failure in circuit breaker using current level
    circuitBreaker.recordFailure(currentFallbackLevel);

    // Update state with error info and next fallback
    this.setState(prevState => ({
      errorInfo,
      fallbackLevel: nextFallbackLevel,
      retryCount: nextRetryCount,
      capabilities
    }));

    // Log error using current values (not state which may be stale)
    console.error(`[WebXR3DErrorBoundary] Error in ${currentFallbackLevel}:`, error, errorInfo);

    // Log to external service if enabled
    if (enableLogging) {
      try {
        await webxrErrorLogger.logError(error, {
          ...errorInfo,
          fallbackLevel: currentFallbackLevel,
          capabilities,
          retryCount: nextRetryCount
        });
      } catch (loggingError) {
        console.warn('Failed to log WebXR error:', loggingError);
      }
    }

    // Call custom error handler
    onError?.(error, errorInfo, nextFallbackLevel);
  }

  private determineNextFallback(
    error: Error,
    capabilities: DeviceCapabilities,
    maxRetries: number,
    retryCount: number,
    currentLevel: FallbackLevel
  ): FallbackLevel {
    // Force final fallback if max retries exceeded
    if (retryCount >= maxRetries) {
      console.warn(`[WebXR3DErrorBoundary] Max retries (${maxRetries}) exceeded, forcing final fallback`);
      return 'final';
    }

    // Progressive fallback logic
    switch (currentLevel) {
      case 'webxr':
        // WebXR failed, try 3D fallback if WebGL is available and circuit isn't open
        if (capabilities.hasWebGL && !circuitBreaker.isOpen('fallback3d')) {
          console.info(`[WebXR3DErrorBoundary] Falling back to 3D (WebGL available: ${capabilities.hasWebGL})`);
          return 'fallback3d';
        }
        console.info(`[WebXR3DErrorBoundary] Skipping 3D fallback (WebGL: ${capabilities.hasWebGL}, Circuit open: ${circuitBreaker.isOpen('fallback3d')})`);
        return 'fallback2d';

      case 'fallback3d':
        // 3D fallback failed, fall back to 2D
        console.info('[WebXR3DErrorBoundary] 3D fallback failed, falling back to 2D');
        return 'fallback2d';

      case 'fallback2d':
        // 2D fallback failed, use final fallback
        console.warn('[WebXR3DErrorBoundary] 2D fallback failed, using final fallback');
        return 'final';

      default:
        console.warn(`[WebXR3DErrorBoundary] Unknown fallback level: ${currentLevel}, using final fallback`);
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
      <LoadingSpinner
        message="Loading WebXR Experience..."
        size="large"
        theme="dark"
      />
    );
  }

  private render2DFallback(): ReactNode {
    const handleRefresh = () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    const handleReturnHome = () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    };

    return (
      <ErrorFallback
        title="3D Experience Unavailable"
        message="WebXR and 3D rendering are not available on your device. Here are some options to continue:"
        suggestions={[
          'Try refreshing the page',
          'Use a WebXR-compatible browser',
          'Visit on a desktop device',
        ]}
        actions={[
          {
            label: 'Refresh Page',
            onClick: handleRefresh,
            variant: 'primary',
          },
          {
            label: 'Return Home',
            onClick: handleReturnHome,
            variant: 'secondary',
          },
        ]}
        severity="warning"
      />
    );
  }

  private renderFinalFallback(): ReactNode {
    const handleResetAndRefresh = () => {
      try {
        circuitBreaker.reset();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to reset and refresh:', error);
      }
    };

    return (
      <ErrorFallback
        title="Critical Error"
        message="Multiple fallback systems have failed. Please try refreshing the page or contact support."
        actions={[
          {
            label: 'Reset & Refresh',
            onClick: handleResetAndRefresh,
            variant: 'primary',
          },
        ]}
        severity="error"
      />
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