import { ANALYTICS_SERVICES, COMPONENT_NAMES } from '../errorConstants';
import type { WebXRErrorDetails } from './ErrorDetailsBuilder';

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

export class AnalyticsService {
  public static logToGoogleAnalytics(errorDetails: WebXRErrorDetails): void {
    if (typeof window === 'undefined' || !(ANALYTICS_SERVICES.GOOGLE in window)) {
      return;
    }

    const { error, webxrSupported, webglSupported, context } = errorDetails;
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

  public static logToSentry(errorDetails: WebXRErrorDetails): void {
    if (typeof window === 'undefined' || !(ANALYTICS_SERVICES.SENTRY in window)) {
      return;
    }

    const { error } = errorDetails;

    (window as WindowWithSentry).Sentry.captureException(error, {
      tags: {
        component: COMPONENT_NAMES.WEBXR_DEFAULT,
        webxr_supported: errorDetails.webxrSupported,
        webgl_supported: errorDetails.webglSupported,
      },
      extra: {
        errorInfo: errorDetails.errorInfo,
        userAgent: errorDetails.userAgent,
        timestamp: errorDetails.timestamp,
      },
    });
  }

  public static logToAnalytics(errorDetails: WebXRErrorDetails): void {
    this.logToGoogleAnalytics(errorDetails);
    this.logToSentry(errorDetails);
  }
}