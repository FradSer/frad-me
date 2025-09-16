import React from 'react';
import { SANITIZATION_LIMITS } from '../errorConstants';
import {
  sanitizeErrorMessage,
  sanitizeErrorName,
  sanitizeUrl,
  sanitizeUserAgent,
} from '../sanitization';

export interface WebXRErrorDetails {
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

export class ErrorDetailsBuilder {
  private static async checkWebXRSupport(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.xr) return false;

    try {
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  private static checkWebGLSupport(): boolean {
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

  public static async buildErrorDetails(
    error: Error,
    errorInfo?: React.ErrorInfo,
    context?: Record<string, unknown>
  ): Promise<WebXRErrorDetails> {
    const errorDetails: WebXRErrorDetails = {
      error: {
        name: sanitizeErrorName(error.name),
        message: sanitizeErrorMessage(error.message),
        stack:
          typeof process !== 'undefined' &&
          process.env?.NODE_ENV === 'development'
            ? error.stack?.substring(0, SANITIZATION_LIMITS.STACK_TRACE)
            : undefined,
      } as Error,
      errorInfo,
      userAgent: sanitizeUserAgent(navigator?.userAgent || 'Unknown'),
      timestamp: new Date().toISOString(),
      url: sanitizeUrl(window?.location.href || 'Unknown'),
      webxrSupported: await this.checkWebXRSupport(),
      webglSupported: this.checkWebGLSupport(),
    };

    return context ? { ...errorDetails, context } : errorDetails;
  }
}