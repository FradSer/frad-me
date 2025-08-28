import { render, screen, act } from '@testing-library/react';
import { WebXRViewProvider, useWebXRView, type WebXRView } from '../WebXRViewContext';

// Mock navigator for WebXR detection
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

// Test component that uses the context
const TestComponent = () => {
  const {
    currentView,
    isTransitioning,
    navigationVisible,
    footerLinksVisible,
    isVisionPro,
    webXRSupported,
    navigateToView,
    setTransitioning,
  } = useWebXRView();

  return (
    <div>
      <div data-testid="current-view">{currentView}</div>
      <div data-testid="is-transitioning">{isTransitioning.toString()}</div>
      <div data-testid="navigation-visible">{navigationVisible.toString()}</div>
      <div data-testid="footer-visible">{footerLinksVisible.toString()}</div>
      <div data-testid="is-vision-pro">{isVisionPro.toString()}</div>
      <div data-testid="webxr-supported">{webXRSupported.toString()}</div>
      <button
        data-testid="navigate-work"
        onClick={() => navigateToView('work')}
      >
        Go to Work
      </button>
      <button
        data-testid="navigate-home"
        onClick={() => navigateToView('home')}
      >
        Go to Home
      </button>
      <button
        data-testid="set-transitioning-true"
        onClick={() => setTransitioning(true)}
      >
        Start Transition
      </button>
      <button
        data-testid="set-transitioning-false"
        onClick={() => setTransitioning(false)}
      >
        End Transition
      </button>
    </div>
  );
};

describe('WebXRViewContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure navigator.xr is properly mocked
    if (mockNavigator.xr && mockNavigator.xr.isSessionSupported) {
      mockNavigator.xr.isSessionSupported.mockResolvedValue(false);
    }
  });

  describe('Provider Setup', () => {
    it('should render children within provider', () => {
      render(
        <WebXRViewProvider>
          <div data-testid="child">Test Child</div>
        </WebXRViewProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should throw error when useWebXRView is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => render(<TestComponent />)).toThrow(
        'useWebXRView must be used within a WebXRViewProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('View Navigation', () => {
    it('should start with home view by default', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('current-view')).toHaveTextContent('home');
    });

    it('should navigate to work view when navigateToView is called', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const navigateButton = screen.getByTestId('navigate-work');

      act(() => {
        navigateButton.click();
      });

      expect(screen.getByTestId('current-view')).toHaveTextContent('work');
    });

    it('should navigate back to home view', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Go to work first
      act(() => {
        screen.getByTestId('navigate-work').click();
      });

      // Then back to home
      act(() => {
        screen.getByTestId('navigate-home').click();
      });

      expect(screen.getByTestId('current-view')).toHaveTextContent('home');
    });
  });

  describe('Transition State Management', () => {
    it('should start with isTransitioning=false', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    });

    it('should update transition state when setTransitioning is called', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Start transition
      act(() => {
        screen.getByTestId('set-transitioning-true').click();
      });

      expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true');

      // End transition
      act(() => {
        screen.getByTestId('set-transitioning-false').click();
      });

      expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    });
  });

  describe('Navigation Visibility', () => {
    it('should have navigation always visible', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('navigation-visible')).toHaveTextContent('true');
    });
  });

  describe('Footer Links Visibility', () => {
    it('should show footer links only on home view', async () => {
      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // On home view, footer should be visible
      expect(screen.getByTestId('footer-visible')).toHaveTextContent('true');

      // Navigate to work view
      act(() => {
        screen.getByTestId('navigate-work').click();
      });

      // On work view, footer should be hidden
      expect(screen.getByTestId('footer-visible')).toHaveTextContent('false');

      // Navigate back to home
      act(() => {
        screen.getByTestId('navigate-home').click();
      });

      // Footer should be visible again
      expect(screen.getByTestId('footer-visible')).toHaveTextContent('true');
    });
  });

  describe('WebXR Support Detection', () => {
    it('should detect WebXR support', async () => {
      mockNavigator.xr.isSessionSupported.mockResolvedValue(true);

      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('webxr-supported')).toHaveTextContent('true');
    });

    it('should handle WebXR detection failure', async () => {
      mockNavigator.xr.isSessionSupported.mockRejectedValue(new Error('WebXR error'));

      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('webxr-supported')).toHaveTextContent('false');
    });

    it('should handle missing WebXR API', async () => {
      delete (window.navigator as any).xr;

      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('webxr-supported')).toHaveTextContent('false');

      // Restore navigator
      (window.navigator as any).xr = mockNavigator.xr;
    });
  });

  describe('Vision Pro Detection', () => {
    it('should detect Vision Pro (iPad with WebXR)', async () => {
      // Mock Vision Pro environment
      Object.defineProperty(window.navigator, 'platform', {
        value: 'iPad',
        writable: true,
      });
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
      });
      mockNavigator.xr.isSessionSupported.mockResolvedValue(true);

      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('is-vision-pro')).toHaveTextContent('true');

      // Reset
      Object.defineProperty(window.navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
      });
    });

    it('should not detect Vision Pro on desktop', async () => {
      // Ensure xr mock is available
      Object.defineProperty(window.navigator, 'xr', {
        value: mockNavigator.xr,
        writable: true,
      });

      render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('is-vision-pro')).toHaveTextContent('false');
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across re-renders', async () => {
      // Ensure xr mock is available
      Object.defineProperty(window.navigator, 'xr', {
        value: mockNavigator.xr,
        writable: true,
      });

      const { rerender } = render(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Navigate to work view
      act(() => {
        screen.getByTestId('navigate-work').click();
      });

      expect(screen.getByTestId('current-view')).toHaveTextContent('work');

      // Re-render
      rerender(
        <WebXRViewProvider>
          <TestComponent />
        </WebXRViewProvider>
      );

      // State should persist
      expect(screen.getByTestId('current-view')).toHaveTextContent('work');
    });
  });

  describe('Multiple Context Consumers', () => {
    const ConsumerA = () => {
      const { currentView } = useWebXRView();
      return <div data-testid="consumer-a">{currentView}</div>;
    };

    const ConsumerB = () => {
      const { navigateToView } = useWebXRView();
      return (
        <button
          data-testid="consumer-b-button"
          onClick={() => navigateToView('work')}
        >
          Navigate from B
        </button>
      );
    };

    it('should synchronize state between multiple consumers', async () => {
      // Ensure xr mock is available
      Object.defineProperty(window.navigator, 'xr', {
        value: mockNavigator.xr,
        writable: true,
      });

      render(
        <WebXRViewProvider>
          <ConsumerA />
          <ConsumerB />
        </WebXRViewProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initially on home
      expect(screen.getByTestId('consumer-a')).toHaveTextContent('home');

      // Navigate from consumer B
      act(() => {
        screen.getByTestId('consumer-b-button').click();
      });

      // Consumer A should see the updated state
      expect(screen.getByTestId('consumer-a')).toHaveTextContent('work');
    });
  });
});
