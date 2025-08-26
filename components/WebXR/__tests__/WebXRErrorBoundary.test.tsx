import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ErrorBoundary from '@/components/common/ErrorBoundary';

// Test constants
const TEST_IDS = {
  normalComponent: 'normal-component',
} as const;

const TEST_MESSAGES = {
  errorBoundary: 'Test error for WebXR Error Boundary',
  webxrUnavailable: 'WebXR Experience Unavailable',
  tryAgain: 'Try Again',
  returnToMain: 'Return to Main',
} as const;

// Mock the error logger
jest.mock('@/utils/errorLogger', () => ({
  webxrErrorLogger: {
    logError: jest.fn(),
    logCapabilities: jest.fn(),
  },
}));

// Test component that throws errors
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error(TEST_MESSAGES.errorBoundary);
  }
  return <div data-testid={TEST_IDS.normalComponent}>Normal Component</div>;
};

describe('ErrorBoundary (WebXR)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary componentName="WebXR">
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument();
    });

    it('should pass through custom props correctly', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary componentName="WebXR" onError={onError}>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors and show WebXR error UI', () => {
      render(
        <ErrorBoundary componentName="WebXR">
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByText('WebXR Error')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to load WebXR experience. Falling back to 2D view.'),
      ).toBeInTheDocument();
    });

    it('should call onError prop when error occurs', async () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary componentName="WebXR" onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Wait a bit for the error handling to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
      );
    });

    it('should log error details for monitoring', () => {
      const { webxrErrorLogger } = require('@/utils/errorLogger');

      render(
        <ErrorBoundary componentName="WebXR">
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(webxrErrorLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
      );
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom Error UI</div>
      );

      render(
        <ErrorBoundary componentName="WebXR" fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByText('WebXR Error')).not.toBeInTheDocument();
    });
  });

  describe('Component Isolation', () => {
    it('should isolate errors to WebXR boundary only', () => {
      const OuterComponent = () => (
        <div data-testid="outer">Outer Component</div>
      );

      render(
        <div>
          <OuterComponent />
          <ErrorBoundary componentName="WebXR">
            <ErrorThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </div>,
      );

      // Outer component should still render normally
      expect(screen.getByTestId('outer')).toBeInTheDocument();
      // Error boundary should catch the error
      expect(screen.getByText('WebXR Error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible error messages', () => {
      render(
        <ErrorBoundary componentName="WebXR">
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const errorHeading = screen.getByRole('heading', {
        name: /webxr error/i,
      });
      expect(errorHeading).toBeInTheDocument();
    });
  });
});
