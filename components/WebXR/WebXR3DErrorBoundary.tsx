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
    if (!this.state.capabilities) {
      const capabilities = DeviceCapabilityService.detectCapabilities();
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
      <LoadingSpinner
        message="Loading WebXR Experience..."
        size="large"
        theme="dark"
      />
    );
  }

  private render2DFallback(): ReactNode {
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
            onClick: () => window.location.reload(),
            variant: 'primary',
          },
          {
            label: 'Return Home',
            onClick: () => (window.location.href = '/'),
            variant: 'secondary',
          },
        ]}
        severity="warning"
      />
    );
  }

  private renderFinalFallback(): ReactNode {
    return (
      <ErrorFallback
        title="Critical Error"
        message="Multiple fallback systems have failed. Please try refreshing the page or contact support."
        actions={[
          {
            label: 'Reset & Refresh',
            onClick: () => {
              circuitBreaker.reset();
              window.location.reload();
            },
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