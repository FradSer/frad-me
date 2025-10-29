import { act, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useWebXRView, WebXRViewProvider } from '@/contexts/WebXR/WebXRViewContext';
import { webxrErrorLogger } from '@/utils/errorLogger';

// Mock navigator for WebXR
const mockNavigator = {
  xr: {
    isSessionSupported: jest.fn(),
  },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  platform: 'MacIntel',
  maxTouchPoints: 0,
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Component that throws different types of errors
const ErrorComponent = ({ errorType }: { errorType: string }) => {
  switch (errorType) {
    case 'webgl':
      throw new Error('WebGL context creation failed');
    case 'webxr':
      throw new Error('WebXR session initialization failed');
    case 'network':
      throw new Error('Network request failed');
    case 'render':
      throw new Error('React render error');
    default:
      throw new Error('Unknown error');
  }
};

// WebXR-specific error component
const WebXRErrorComponent = ({ errorType }: { errorType: string }) => {
  const { currentView } = useWebXRView();

  if (currentView === 'work' && errorType === 'work-view-error') {
    throw new Error('Work view specific error');
  }

  return (
    <div>
      <div data-testid="webxr-content">WebXR Content</div>
      <div data-testid="current-view-display">{currentView}</div>
    </div>
  );
};

// Main test component that includes error boundaries
const TestApp = ({ triggerError, errorType }: { triggerError: boolean; errorType: string }) => {
  return (
    <ErrorBoundary componentName="WebXR">
      <WebXRViewProvider>
        <ErrorBoundary componentName="WebXR-Content">
          {triggerError ? (
            <ErrorComponent errorType={errorType} />
          ) : (
            <WebXRErrorComponent errorType={errorType} />
          )}
        </ErrorBoundary>
      </WebXRViewProvider>
    </ErrorBoundary>
  );
};

describe('WebXR Error Recovery Fallback Chain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigator.xr.isSessionSupported.mockResolvedValue(false);

    // Mock error logger
    jest.spyOn(webxrErrorLogger, 'logError').mockResolvedValue();
  });

  describe('Error Boundary Hierarchy', () => {
    it('should catch errors in nested components and show appropriate fallbacks', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should show WebXR error UI (outer boundary catches WebXR-related errors)
      expect(screen.getByText('WebXR Error')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to load WebXR experience. Falling back to 2D view.'),
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle different error types with appropriate recovery', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Test WebGL error
      const { rerender } = render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByText('WebXR Error')).toBeInTheDocument();

      // Test WebXR error
      rerender(<TestApp triggerError={true} errorType="webxr" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByText('WebXR Error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Logging Integration', () => {
    it('should log errors to the error logger', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Verify error was logged
      expect(webxrErrorLogger.logError).toHaveBeenCalled();
      expect(webxrErrorLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
        expect.objectContaining({
          component: 'WebXR-Content',
        }),
      );

      consoleSpy.mockRestore();
    });

    it('should include error context in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={true} errorType="webxr" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const logCall = (webxrErrorLogger.logError as jest.Mock).mock.calls[0];
      const errorDetails = logCall[2]; // Third parameter is context

      expect(errorDetails).toHaveProperty('component', 'WebXR-Content');
      expect(errorDetails).toHaveProperty('webxrSupported');
      expect(errorDetails).toHaveProperty('webglSupported');

      consoleSpy.mockRestore();
    });
  });

  describe('Graceful Degradation', () => {
    it('should maintain app functionality when WebXR fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={false} errorType="normal" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should show normal content
      expect(screen.getByTestId('webxr-content')).toBeInTheDocument();
      expect(screen.getByTestId('current-view-display')).toHaveTextContent('home');

      // Trigger an error in work view
      const { rerender } = render(<TestApp triggerError={false} errorType="work-view-error" />);

      // Navigate to work view first
      const navigateButton = screen.getByTestId('navigate-work');
      act(() => {
        navigateButton.click();
      });

      // Now trigger error
      rerender(<TestApp triggerError={true} errorType="work-view-error" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should show error boundary but maintain navigation
      expect(screen.getByText('WebXR Error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should allow navigation after error recovery', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={false} errorType="normal" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Navigate to work view
      act(() => {
        screen.getByTestId('navigate-work').click();
      });

      expect(screen.getByTestId('current-view-display')).toHaveTextContent('work');

      // Navigate back to home
      act(() => {
        screen.getByTestId('navigate-home').click();
      });

      expect(screen.getByTestId('current-view-display')).toHaveTextContent('home');

      consoleSpy.mockRestore();
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should provide retry functionality through error boundary', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock window.location.reload
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should show refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      expect(refreshButton).toBeInTheDocument();

      // Click refresh
      act(() => {
        refreshButton.click();
      });

      expect(reloadMock).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle multiple error recovery attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // First error
      const { rerender } = render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByText('WebXR Error')).toBeInTheDocument();

      // Second error (different type)
      rerender(<TestApp triggerError={true} errorType="webxr" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should still show error boundary
      expect(screen.getByText('WebXR Error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Impact', () => {
    it('should not significantly impact performance during error states', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const startTime = performance.now();

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Error boundary render should be fast (< 100ms)
      expect(renderTime).toBeLessThan(100);

      consoleSpy.mockRestore();
    });

    it('should handle rapid error state changes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { rerender } = render(<TestApp triggerError={false} errorType="normal" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Rapidly change between error and normal states
      for (let i = 0; i < 5; i++) {
        rerender(<TestApp triggerError={true} errorType="webgl" />);
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        rerender(<TestApp triggerError={false} errorType="normal" />);
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });
      }

      // Should handle rapid changes without crashing
      expect(screen.getByTestId('webxr-content')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible error messages', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check for semantic error structure
      const errorHeading = screen.getByRole('heading', { level: 2 });
      expect(errorHeading).toHaveTextContent('Something went wrong');

      // Check for descriptive error text
      expect(
        screen.getByText('An unexpected error occurred. Please try refreshing the page.'),
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should maintain keyboard navigation during errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<TestApp triggerError={true} errorType="webgl" />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Refresh button should be keyboard accessible
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      expect(refreshButton).toHaveAttribute('tabIndex', '0');

      consoleSpy.mockRestore();
    });
  });
});
