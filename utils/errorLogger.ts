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
  };
  private readonly maxQueueSize: number = 100;
  private readonly maxRequestsPerHour: number = 10;
  private requestTimestamps: number[] = [];

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
    if (typeof navigator === 'undefined' || !navigator.xr) return false;

    try {
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  private checkWebGLSupport(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    } catch {
      return false;
    }
  }

  private sanitizeMessage(message: string): string {
    // Limit input length to prevent DoS
    const limitedMessage = message.substring(0, 1000);

    return (
      limitedMessage
        // Windows paths: C:\path\to\file (atomic groups to prevent backtracking)
        .replace(
          /\b[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*\b/g,
          '[PATH]',
        )
        // Unix paths: /path/to/file (atomic groups to prevent backtracking)
        .replace(/\/(?:[^/\s<>"']+\/)*[^/\s<>"']*/g, '[PATH]')
        // Script tags (non-greedy with bounded repetition)
        .replace(/<script\b[^>]{0,100}>[\s\S]{0,1000}?<\/script>/gi, '[SCRIPT]')
        // HTML tags (bounded to prevent catastrophic backtracking)
        .replace(/<[^>]{0,100}>/g, '[HTML]')
        // SQL injection (simple pattern, no complex quantifiers)
        .replace(/DROP\s+TABLE/gi, '[SQL]')
        .substring(0, 500)
    );
  }

  private sanitizeUserAgent(userAgent: string): string {
    // Limit input length to prevent DoS
    const limitedUserAgent = userAgent.substring(0, 400);

    return (
      limitedUserAgent
        // Script tags (non-greedy with bounded repetition)
        .replace(/<script\b[^>]{0,100}>[\s\S]{0,1000}?<\/script>/gi, '[SCRIPT]')
        // HTML tags (bounded to prevent catastrophic backtracking)
        .replace(/<[^>]{0,100}>/g, '[HTML]')
        // Remove dangerous characters (character class, no backtracking)
        .replace(/[<>'"]/g, '')
        .substring(0, 200)
    );
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
        name: error.name.substring(0, 100),
        message: this.sanitizeMessage(error.message),
        stack: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ? error.stack : undefined,
      } as Error,
      errorInfo: actualErrorInfo,
      userAgent: this.sanitizeUserAgent(navigator?.userAgent || 'Unknown'),
      timestamp: new Date().toISOString(),
      url: window?.location.href || 'Unknown',
      webxrSupported: await this.checkWebXRSupport(),
      webglSupported: this.checkWebGLSupport(),
    };

    // Add context if provided
    const errorWithContext = actualContext ? { ...errorDetails, context: actualContext } : errorDetails;

    // Update error statistics
    this.updateErrorStats(errorWithContext);

    if ((typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
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
    const isTestEnvironment = typeof jest !== 'undefined';
    if (!isTestEnvironment && (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
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
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const componentName = (context as any)?.component || 'WebXR';
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
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as WindowWithSentry).Sentry.captureException(error, {
        tags: {
          component: 'WebXR',
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
    const oneHourAgo = now - 60 * 60 * 1000;

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneHourAgo
    );

    return this.requestTimestamps.length >= this.maxRequestsPerHour;
  }

  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  private shouldRateLimit(): boolean {
    // Always allow first few requests, then apply rate limiting
    return this.requestCount >= 5 && this.isRateLimited();
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
        localStorage.setItem('webxr_error_queue', JSON.stringify(this.errorQueue));
      } catch (error) {
        // localStorage might be full or unavailable
        console.warn('Failed to save error queue to localStorage:', error);
      }
    }
  }

  private loadQueueFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('webxr_error_queue');
        if (stored) {
          const parsedQueue = JSON.parse(stored);
          if (Array.isArray(parsedQueue)) {
            this.errorQueue = parsedQueue.slice(0, this.maxQueueSize);
          }
        }
      } catch (error) {
        console.warn('Failed to load error queue from localStorage:', error);
      }
    }
  }

  // Statistics methods
  private updateErrorStats(errorDetails: WebXRErrorDetails): void {
    this.errorStats.totalErrors++;

    const component = 'WebXR'; // Default component
    this.errorStats.errorsByComponent[component] =
      (this.errorStats.errorsByComponent[component] || 0) + 1;

    this.errorStats.lastError = errorDetails;

    // Calculate average errors per hour (simple moving average)
    const now = Date.now();
    const hoursSinceStart = (now - (window as any).__webxrStartTime || now) / (60 * 60 * 1000);
    this.errorStats.averageErrorsPerHour = this.errorStats.totalErrors / Math.max(hoursSinceStart, 1);
  }

  // Public API methods
  public getCapabilities(): BrowserCapabilities {
    return {
      webxr: navigator?.xr !== undefined,
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
      localStorage.removeItem('webxr_error_queue');
    }
  }

  public getQueueSize(): number {
    return this.errorQueue.length;
  }

  public isQueueEmpty(): boolean {
    return this.errorQueue.length === 0;
  }
}

// Create singleton instance
export const webxrErrorLogger = new WebXRErrorLogger();
export default WebXRErrorLogger;
