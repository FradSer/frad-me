interface WebXRErrorDetails {
  error: Error;
  errorInfo?: React.ErrorInfo;
  userAgent: string;
  timestamp: string;
  url: string;
  webxrSupported?: boolean;
  webglSupported?: boolean;
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
    errorInfo?: React.ErrorInfo,
  ): Promise<void> {
    const errorDetails: WebXRErrorDetails = {
      error: {
        name: error.name.substring(0, 100),
        message: this.sanitizeMessage(error.message),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      } as Error,
      errorInfo: process.env.NODE_ENV === 'development' ? errorInfo : undefined,
      userAgent: this.sanitizeUserAgent(navigator?.userAgent || 'Unknown'),
      timestamp: new Date().toISOString(),
      url: window?.location.href || 'Unknown',
      webxrSupported: await this.checkWebXRSupport(),
      webglSupported: this.checkWebGLSupport(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('WebXR Error logged:', errorDetails);
    }

    if (this.isOnline) {
      await this.sendError(errorDetails);
    } else {
      this.errorQueue.push(errorDetails);
    }

    this.logToAnalytics(errorDetails);
  }

  private async sendError(errorDetails: WebXRErrorDetails): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error logging skipped in development mode:', errorDetails);
      return;
    }

    try {
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
      this.errorQueue.push(errorDetails);
    }
  }

  private logToAnalytics(errorDetails: WebXRErrorDetails): void {
    const { error, webxrSupported, webglSupported } = errorDetails;

    // Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as WindowWithGtag).gtag('event', 'exception', {
        description: `WebXR: ${error.message}`,
        fatal: false,
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
}

// Create singleton instance
export const webxrErrorLogger = new WebXRErrorLogger();
export default WebXRErrorLogger;
