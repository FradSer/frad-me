import { TIME_CONSTANTS } from './constants/index';
import {
  COMPONENT_NAMES,
  ERROR_QUEUE_CONFIG,
  STORAGE_KEYS,
} from './errorConstants';
import { AnalyticsService } from './services/AnalyticsService';
import {
  ErrorDetailsBuilder,
  type WebXRErrorDetails,
} from './services/ErrorDetailsBuilder';
import { ErrorParameterParser } from './services/ErrorParameterParser';

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
  private readonly maxRequestsPerHour: number =
    ERROR_QUEUE_CONFIG.MAX_REQUESTS_PER_HOUR;
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

  public async logError(
    error: Error,
    errorInfoOrContext?: React.ErrorInfo | Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<void> {
    const { errorInfo, context: parsedContext } =
      ErrorParameterParser.parseErrorContext(errorInfoOrContext, context);

    const errorDetails = await ErrorDetailsBuilder.buildErrorDetails(
      error,
      errorInfo,
      parsedContext,
    );

    this.processAndLogError(errorDetails);
  }

  private async processAndLogError(
    errorDetails: WebXRErrorDetails,
  ): Promise<void> {
    this.updateErrorStats(errorDetails);

    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'development'
    ) {
      console.error('WebXR Error logged:', errorDetails);
    }

    if (this.isOnline && !this.shouldRateLimit()) {
      await this.sendError(errorDetails);
    } else {
      this.addToQueue(errorDetails);
    }

    AnalyticsService.logToAnalytics(errorDetails);
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
    const oneHourAgo = now - TIME_CONSTANTS.MILLISECONDS_PER_HOUR;

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneHourAgo,
    );

    return this.requestTimestamps.length >= this.maxRequestsPerHour;
  }

  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  private shouldRateLimit(): boolean {
    // Always allow first few requests, then apply rate limiting
    return (
      this.requestCount >= ERROR_QUEUE_CONFIG.RATE_LIMIT_THRESHOLD &&
      this.isRateLimited()
    );
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
        localStorage.setItem(
          STORAGE_KEYS.ERROR_QUEUE,
          JSON.stringify(this.errorQueue),
        );
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
    const startTime = (window as Window & { __webxrStartTime?: number })
      .__webxrStartTime;
    const hoursSinceStart =
      (now - (startTime || now)) / TIME_CONSTANTS.MILLISECONDS_PER_HOUR;
    this.errorStats.averageErrorsPerHour =
      this.errorStats.totalErrors / Math.max(hoursSinceStart, 1);
  }

  // Public API methods
  public getCapabilities(): BrowserCapabilities {
    return {
      webxr: navigator?.xr !== undefined,
      webgl: this.checkWebGLSupport(),
      webgl2: this.checkWebGL2Support(),
    };
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

  private checkWebGL2Support(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch {
      return false;
    }
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
}

// Create singleton instance
export const webxrErrorLogger = new WebXRErrorLogger();
export default WebXRErrorLogger;
