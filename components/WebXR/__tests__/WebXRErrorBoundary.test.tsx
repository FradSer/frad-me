import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import WebXRErrorBoundary from '@/components/WebXR/WebXRErrorBoundary';

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

describe('WebXRErrorBoundary', () => {
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
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>,
      );

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument();
    });

    it('should pass through custom props correctly', () => {
      const onError = jest.fn();

      render(
        <WebXRErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={false} />
        </WebXRErrorBoundary>,
      );

      expect(screen.getByTestId(TEST_IDS.normalComponent)).toBeInTheDocument();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors and show hero-style error UI', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      expect(
        screen.getByText(TEST_MESSAGES.webxrUnavailable),
      ).toBeInTheDocument();
      expect(screen.getByText(TEST_MESSAGES.tryAgain)).toBeInTheDocument();
      expect(screen.getByText(TEST_MESSAGES.returnToMain)).toBeInTheDocument();
    });

    it('should call onError prop when error occurs', () => {
      const onError = jest.fn();

      render(
        <WebXRErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
      );
    });

    it('should log error details for monitoring', () => {
      const { webxrErrorLogger } = require('@/utils/errorLogger');

      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      expect(webxrErrorLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
      );
    });
  });

  describe('Error UI Actions', () => {
    it('should render action buttons', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      expect(screen.getByText(TEST_MESSAGES.tryAgain)).toBeInTheDocument();
      expect(screen.getByText(TEST_MESSAGES.returnToMain)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom Error UI</div>
      );

      render(
        <WebXRErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(
        screen.queryByText(TEST_MESSAGES.webxrUnavailable),
      ).not.toBeInTheDocument();
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
          <WebXRErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </WebXRErrorBoundary>
        </div>,
      );

      // Outer component should still render normally
      expect(screen.getByTestId('outer')).toBeInTheDocument();
      // Error boundary should catch the error
      expect(
        screen.getByText(TEST_MESSAGES.webxrUnavailable),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible error messages', () => {
      render(
        <WebXRErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </WebXRErrorBoundary>,
      );

      const errorHeading = screen.getByRole('heading', {
        name: /webxr experience unavailable/i,
      });
      expect(errorHeading).toBeInTheDocument();

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();

      const returnButton = screen.getByRole('button', {
        name: /return to main/i,
      });
      expect(returnButton).toBeInTheDocument();
    });
  });
});
