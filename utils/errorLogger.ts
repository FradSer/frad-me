interface WebXRErrorDetails {
  error: Error
  errorInfo?: React.ErrorInfo
  userAgent: string
  timestamp: string
  url: string
  webxrSupported?: boolean
  webglSupported?: boolean
}

class WebXRErrorLogger {
  private errorQueue: WebXRErrorDetails[] = []
  private isOnline: boolean = true

  constructor() {
    if (typeof window === 'undefined') return

    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private async checkWebXRSupport(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.xr) return false

    try {
      return await navigator.xr.isSessionSupported('immersive-vr')
    } catch {
      return false
    }
  }

  private checkWebGLSupport(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const canvas = document.createElement('canvas')
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )
    } catch {
      return false
    }
  }

  private sanitizeMessage(message: string): string {
    return message.replace(/\/[^\s]+/g, '[PATH]').substring(0, 500)
  }

  private sanitizeUserAgent(userAgent: string): string {
    return userAgent.replace(/[<>'"]/g, '').substring(0, 200)
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
    }

    console.error('WebXR Error logged:', errorDetails)

    if (this.isOnline) {
      await this.sendError(errorDetails)
    } else {
      this.errorQueue.push(errorDetails)
    }

    this.logToAnalytics(errorDetails)
  }

  private async sendError(errorDetails: WebXRErrorDetails): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error logging skipped in development mode:', errorDetails)
      return
    }

    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorDetails),
      })

      if (!response.ok) {
        console.warn('Failed to send error to server:', response.statusText)
      }
    } catch (sendError) {
      console.warn('Error sending error log:', sendError)
      this.errorQueue.push(errorDetails)
    }
  }

  private logToAnalytics(errorDetails: WebXRErrorDetails): void {
    const { error, webxrSupported, webglSupported } = errorDetails

    // Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'exception', {
        description: `WebXR: ${error.message}`,
        fatal: false,
        custom_map: {
          webxr_supported: webxrSupported,
          webgl_supported: webglSupported,
          error_name: error.name,
        },
      })
    }

    // Sentry
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      ;(window as any).Sentry.captureException(error, {
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
      })
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    for (const error of errors) {
      await this.sendError(error)
    }
  }
}

// Create singleton instance
export const webxrErrorLogger = new WebXRErrorLogger()
export default WebXRErrorLogger
