import React from 'react';

interface ParsedErrorParameters {
  errorInfo?: React.ErrorInfo;
  context?: Record<string, unknown>;
}

export class ErrorParameterParser {
  private static isReactErrorInfo(obj: unknown): obj is React.ErrorInfo {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      ('componentStack' in obj || 'errorBoundary' in obj)
    );
  }

  public static parseErrorContext(
    errorInfoOrContext?: React.ErrorInfo | Record<string, unknown>,
    fallbackContext?: Record<string, unknown>
  ): ParsedErrorParameters {
    if (!errorInfoOrContext) {
      return { errorInfo: undefined, context: fallbackContext };
    }

    if (this.isReactErrorInfo(errorInfoOrContext)) {
      return { errorInfo: errorInfoOrContext, context: fallbackContext };
    }

    return { errorInfo: undefined, context: errorInfoOrContext };
  }
}