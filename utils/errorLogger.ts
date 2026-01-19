import {
  ANALYTICS_SERVICES,
  COMPONENT_NAMES,
  ERROR_QUEUE_CONFIG,
  SANITIZATION_LIMITS,
  STORAGE_KEYS,
} from './errorConstants';
import {
  sanitizeErrorMessage,
  sanitizeErrorName,
  sanitizeUrl,
  sanitizeUserAgent,
} from './sanitization';

interface WebXRErrorDetails {
  error: Error;
  errorInfo?: React.ErrorInfo;
  userAgent: string;
  timestamp: string;
  url: string;
  webxrSupported?: boolean;
  webglSupported?: boolean;
  requestNumber?: number;
  context?: Record<string, unknown>;
}

interface ErrorStats {
  totalErrors: number;
  errorsByComponent: Record<string, number>;
  lastError?: WebXRErrorDetails;
  averageErrorsPerHour: number;
  lastErrorTime?: string;
  queueSize: number;
}

interface BrowserCapabilities {
  webxr: boolean;
  webgl: boolean;
  webgl2?: boolean;
}

// Type definitions for global analytics services
interface WindowWithGtag extends Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: Record<string, unknown>,
  ) => void;
}

interface WindowWithSentry extends Window {
  Sentry: {
    captureException: (
      error: Error,
      config?: {
        tags?: Record<string, unknown>;
        extra?: Record<string, unknown>;
      },
    ) => void;
  };
}

class WebXRErrorLogger {
  private errorQueue: WebXRErrorDetails[] = [];
  private isOnline: boolean = true;
  private requestCount: number = 0;
  private errorStats: ErrorStats = {
    totalErrors: 0,
    errorsByComponent: {},
    averageErrorsPerHour: 0,
    queueSize: 0,
  };
  private readonly maxQueueSize: number = ERROR_QUEUE_CONFIG.MAX_QUEUE_SIZE;
  private readonly maxRequestsPerHour: number = ERROR_QUEUE_CONFIG.MAX_REQUESTS_PER_HOUR;
  private requestTimestamps: number[] = [];
  private webglSupportCache: boolean | null = null;
  private webxrSupportCache: boolean | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async checkWebXRSupport(): Promise<boolean> {
    if (this.webxrSupportCache !== null) return this.webxrSupportCache;

    try {
      if (typeof navigator === 'undefined' || !navigator.xr) {
        this.webxrSupportCache = false;
      } else {
        this.webxrSupportCache = await navigator.xr.isSessionSupported('immersive-vr');
      }
    } catch {
      this.webxrSupportCache = false;
    }
    return this.webxrSupportCache;
  }

  private checkWebGLSupport(): boolean {
    if (this.webglSupportCache !== null) return this.webglSupportCache;
    if (typeof window === 'undefined') return false;

    try {
      const canvas = document.createElement('canvas');
      this.webglSupportCache = !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    } catch {
      this.webglSupportCache = false;
    }
    return this.webglSupportCache;
  }

  public async logError(
    error: Error,
    errorInfoOrContext?: React.ErrorInfo | Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<void> {
    // Determine if second parameter is errorInfo or context
    let actualErrorInfo: React.ErrorInfo | undefined;
    let actualContext: Record<string, unknown> | undefined;

    if (errorInfoOrContext && typeof errorInfoOrContext === 'object') {
      // Check if it has React error info properties
      if ('componentStack' in errorInfoOrContext || 'errorBoundary' in errorInfoOrContext) {
        actualErrorInfo = errorInfoOrContext as React.ErrorInfo;
        actualContext = context;
      } else {
        // It's context data
        actualContext = errorInfoOrContext as Record<string, unknown>;
        actualErrorInfo = undefined;
      }
    }

    const errorDetails: WebXRErrorDetails = {
      error: {
        name: sanitizeErrorName(error.name),
        message: sanitizeErrorMessage(error.message),
        stack:
          typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
            ? error.stack?.substring(0, SANITIZATION_LIMITS.STACK_TRACE)
            : undefined,
      } as Error,
      errorInfo: actualErrorInfo,
      userAgent: sanitizeUserAgent(navigator?.userAgent || 'Unknown'),
      timestamp: new Date().toISOString(),
      url: sanitizeUrl(window?.location.href || 'Unknown'),
      webxrSupported: await this.checkWebXRSupport(),
      webglSupported: this.checkWebGLSupport(),
    };

    // Add context if provided
    const errorWithContext = actualContext
      ? { ...errorDetails, context: actualContext }
      : errorDetails;

    // Update error statistics
    this.updateErrorStats(errorWithContext);

    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('WebXR Error logged:', errorWithContext);
    }

    if (this.isOnline && !this.shouldRateLimit()) {
      await this.sendError(errorWithContext);
    } else {
      this.addToQueue(errorWithContext);
    }

    this.logToAnalytics(errorWithContext);
  }

  private async sendError(errorDetails: WebXRErrorDetails): Promise<void> {
    // In test environment, always attempt to send (don't skip based on NODE_ENV)
    const isTestEnvironment = typeof global !== 'undefined' && 'jest' in global;
    if (
      !isTestEnvironment &&
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'development'
    ) {
      console.warn('Error logging skipped in development mode:', errorDetails);
      return;
    }

    this.requestCount++;
    this.recordRequest();

    try {
      // Check if fetch is available (might not be in test environments)
      if (typeof fetch === 'undefined') {
        throw new Error('fetch is not available');
      }

      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorDetails),
      });

      if (!response.ok) {
        console.warn('Failed to send error to server:', response.statusText);
      }
    } catch (sendError) {
      console.warn('Error sending error log:', sendError);
      this.addToQueue(errorDetails);
    }
  }

  private logToAnalytics(errorDetails: WebXRErrorDetails): void {
    const { error, webxrSupported, webglSupported, context } = errorDetails;

    // Google Analytics
    if (typeof window !== 'undefined' && ANALYTICS_SERVICES.GOOGLE in window) {
      const componentName =
        ((context as Record<string, unknown>)?.component as string) ||
        COMPONENT_NAMES.WEBXR_DEFAULT;
      (window as WindowWithGtag).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_parameter_component: componentName,
        custom_map: {
          webxr_supported: webxrSupported,
          webgl_supported: webglSupported,
          error_name: error.name,
        },
      });
    }

    // Sentry
    if (typeof window !== 'undefined' && ANALYTICS_SERVICES.SENTRY in window) {
      (window as WindowWithSentry).Sentry.captureException(error, {
        tags: {
          component: COMPONENT_NAMES.WEBXR_DEFAULT,
          webxr_supported: webxrSupported,
          webgl_supported: webglSupported,
        },
        extra: {
          errorInfo: errorDetails.errorInfo,
          userAgent: errorDetails.userAgent,
          timestamp: errorDetails.timestamp,
        },
      });
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errors) {
      await this.sendError(error);
    }
  }

  // Rate limiting methods
  private isRateLimited(): boolean {
    const now = Date.now();
    const oneHourAgo = now - ERROR_QUEUE_CONFIG.MILLISECONDS_PER_HOUR;

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => timestamp > oneHourAgo);

    return this.requestTimestamps.length >= this.maxRequestsPerHour;
  }

  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  private shouldRateLimit(): boolean {
    // Always allow first few requests, then apply rate limiting
    return this.requestCount >= ERROR_QUEUE_CONFIG.RATE_LIMIT_THRESHOLD && this.isRateLimited();
  }

  // Queue management methods
  private addToQueue(errorDetails: WebXRErrorDetails): void {
    if (this.errorQueue.length >= this.maxQueueSize) {
      // Remove oldest error to make room
      this.errorQueue.shift();
    }
    this.errorQueue.push(errorDetails);

    // Store in localStorage if available
    this.saveQueueToStorage();
  }

  private saveQueueToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.ERROR_QUEUE, JSON.stringify(this.errorQueue));
      } catch (error) {
        // localStorage might be full or unavailable
        console.warn('Failed to save error queue to localStorage:', error);
      }
    }
  }

  // Statistics methods
  private updateErrorStats(errorDetails: WebXRErrorDetails): void {
    this.errorStats.totalErrors++;

    const component = COMPONENT_NAMES.WEBXR_DEFAULT;
    this.errorStats.errorsByComponent[component] =
      (this.errorStats.errorsByComponent[component] || 0) + 1;

    this.errorStats.lastError = errorDetails;

    // Calculate average errors per hour (simple moving average)
    const now = Date.now();
    const startTime = (window as Window & { __webxrStartTime?: number }).__webxrStartTime;
    const hoursSinceStart = (now - (startTime || now)) / (60 * 60 * 1000);
    this.errorStats.averageErrorsPerHour =
      this.errorStats.totalErrors / Math.max(hoursSinceStart, 1);
  }

  // Public API methods
  public getCapabilities(): BrowserCapabilities {
    let webxrSupported = false;
    try {
      webxrSupported = typeof navigator !== 'undefined' && navigator.xr !== undefined;
    } catch {
      webxrSupported = false;
    }

    return {
      webxr: webxrSupported,
      webgl: this.checkWebGLSupport(),
      webgl2: (() => {
        if (typeof window === 'undefined') return false;
        try {
          const canvas = document.createElement('canvas');
          return !!canvas.getContext('webgl2');
        } catch {
          return false;
        }
      })(),
    };
  }

  public getStats(): ErrorStats {
    return {
      ...this.errorStats,
      lastErrorTime: this.errorStats.lastError?.timestamp,
      queueSize: this.errorQueue.length,
    };
  }

  public clearQueue(): void {
    this.errorQueue = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ERROR_QUEUE);
    }
  }

  public getQueueSize(): number {
    return this.errorQueue.length;
  }

  public isQueueEmpty(): boolean {
    return this.errorQueue.length === 0;
  }

  /** @internal - For testing purposes only */
  public resetForTesting(): void {
    this.errorQueue = [];
    this.requestCount = 0;
    this.requestTimestamps = [];
    this.errorStats = {
      totalErrors: 0,
      errorsByComponent: {},
      averageErrorsPerHour: 0,
      queueSize: 0,
    };
    this.isOnline = true;
  }
}

// Create singleton instance
export const webxrErrorLogger = new WebXRErrorLogger();
export default WebXRErrorLogger;
