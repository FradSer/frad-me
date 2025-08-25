import React, { type ReactNode, type ErrorInfo } from 'react';
import {
  BaseErrorBoundary,
  type BaseErrorBoundaryProps,
  type BaseErrorBoundaryState,
  handleErrorLogging,
} from './shared/BaseErrorBoundary';

interface WebXR3DErrorBoundaryProps extends BaseErrorBoundaryProps {
  componentName?: string;
}

class WebXR3DErrorBoundary extends BaseErrorBoundary<
  WebXR3DErrorBoundaryProps,
  BaseErrorBoundaryState
> {
  protected getInitialState(): BaseErrorBoundaryState {
    return { hasError: false };
  }

  protected async handleLogging(
    error: Error,
    errorInfo: ErrorInfo,
    componentNameFromBase?: string,
    enableLogging = true,
  ): Promise<void> {
    const { componentName = 'Unknown3DComponent' } = this.props;
    const enhancedError = new Error(
      `3D Component Error in ${componentName}: ${error.message}`,
    );
    enhancedError.stack = error.stack;

    // Log to console with the enhanced error
    console.error(
      `[WebXR 3D Error Boundary - ${componentName}]`,
      enhancedError,
      errorInfo,
    );

    // Log the enhanced error to external services
    await handleErrorLogging(
      enhancedError,
      errorInfo,
      componentName,
      enableLogging,
    );
  }

  protected renderFallback(): ReactNode {
    // Return null for 3D components to not break the scene
    return null;
  }
}

export default WebXR3DErrorBoundary;
