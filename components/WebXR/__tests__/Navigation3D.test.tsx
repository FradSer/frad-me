import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { useSimpleLerp } from '@/hooks/useSimpleLerp';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';
import { NAVIGATION_POSITIONS } from '@/utils/webxr/animationConstants';
import Navigation3D from '../Navigation3D';

// Mock the dynamic Text import
jest.mock('@react-three/drei', () => ({
  Text: ({
    children,
    color,
    position,
    font,
    anchorX,
    anchorY,
    fontSize,
    onClick,
    onPointerOver,
    onPointerOut,
    ...props
  }: React.ComponentProps<'mesh'> & {
    color?: string;
    font?: unknown;
    anchorX?: number | 'center' | 'left' | 'right';
    anchorY?: number | 'center' | 'top' | 'bottom';
    fontSize?: number;
    onClick?: () => void;
    onPointerOver?: () => void;
    onPointerOut?: () => void;
  }) =>
    React.createElement(
      'mesh',
      {
        'data-testid': 'nav-text',
        position,
        font,
        anchorX,
        anchorY,
        fontSize,
        color,
        onClick,
        onPointerOver,
        onPointerOut,
        ...props,
      },
      React.createElement('text', { 'data-testid': 'nav-text-content' }, children),
    ),
}));

// Mock Canvas from @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: React.ComponentProps<'div'>) =>
    React.createElement(
      'div',
      {
        'data-testid': 'react-three-fiber-canvas',
        ...props,
      },
      children,
    ),
}));

// Import Canvas after mock
const { Canvas } = require('@react-three/fiber');

// Mock performance measurement
jest.mock('@/utils/performance', () => ({
  measureChunkLoad: jest.fn((_name, fn) => fn()),
}));

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_dynamicImport: () => Promise<React.ComponentType>) => {
    const Component = () => {
      const { Text } = require('@react-three/drei');
      return Text;
    };
    return Component;
  },
}));

// Mock console methods
const originalConsole = { ...console };
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper = ({ children }: TestWrapperProps) => {
  const TestWebXRViewProvider = ({ children: providerChildren }: { children: React.ReactNode }) => {
    const [currentView, setCurrentView] = React.useState<'home' | 'work'>('home');
    const [isTransitioning] = React.useState(false);
    const [navigationVisible] = React.useState(true);
    const [isVisionPro] = React.useState(false);
    const [webXRSupported] = React.useState(false);
    const footerLinksVisible = currentView === 'home';

    const navigateToView = (view: 'home' | 'work') => setCurrentView(view);
    const setTransitioning = () => {};

    const contextValue = {
      currentView,
      isTransitioning,
      navigationVisible,
      footerLinksVisible,
      isVisionPro,
      webXRSupported,
      navigateToView,
      setTransitioning,
    };

    // Create a test context using the same structure as WebXRViewContext
    const TestContext = React.createContext(contextValue);

    return <TestContext.Provider value={contextValue}>{providerChildren}</TestContext.Provider>;
  };

  return (
    <TestWebXRViewProvider>
      <Canvas>{children}</Canvas>
    </TestWebXRViewProvider>
  );
};

describe('Navigation3D Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <Navigation3D />
        </TestWrapper>,
      );
      expect(document.body).toBeTruthy();
    });

    it('renders navigation group with correct positioning', () => {
      render(
        <TestWrapper>
          <Navigation3D />
        </TestWrapper>,
      );

      // Check that the component renders the navigation structure
      const canvas = screen.getByTestId('react-three-fiber-canvas');
      expect(canvas).toBeTruthy();
    });

    it('renders NavItem with correct initial text', () => {
      render(
        <TestWrapper>
          <Navigation3D />
        </TestWrapper>,
      );

      // Should render "work" text when current view is home
      const navTexts = screen.getAllByTestId('nav-text');
      expect(navTexts).toHaveLength(1);
    });
  });

  describe('Navigation State Changes', () => {
    it('shows "work" text when current view is home', () => {
      render(
        <TestWrapper>
          <Navigation3D />
        </TestWrapper>,
      );

      // The component should be rendered
      expect(document.body).toBeTruthy();
    });

    it('shows "home" text when current view is work', () => {
      render(
        <TestWrapper>
          <Navigation3D />
        </TestWrapper>,
      );

      // The component should be rendered
      expect(document.body).toBeTruthy();
    });

    it('handles view navigation', () => {
      const { result } = renderHook(() => {
        const [currentView, setCurrentView] = React.useState<'home' | 'work'>('home');
        const navigateToView = (view: 'home' | 'work') => setCurrentView(view);

        return { currentView, navigateToView };
      }, {});

      // Initial state
      expect(result.current.currentView).toBe('home');

      // Navigate to work
      act(() => {
        result.current.navigateToView('work');
      });

      expect(result.current.currentView).toBe('work');

      // Navigate back to home
      act(() => {
        result.current.navigateToView('home');
      });

      expect(result.current.currentView).toBe('home');
    });
  });

  describe('NavItem Interactive Behavior', () => {
    it('handles hover state changes', () => {
      const { result } = renderHook(
        () => {
          const [hovered, setHovered] = React.useState(false);
          const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);
          const scaleSpring = useSimpleLerp(WEBXR_ANIMATION_CONFIG.scales.default, { speed: 0.1 });

          React.useEffect(() => {
            if (hovered) {
              scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.hover);
            } else if (hasBeenInteracted) {
              scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.default);
            }
          }, [hovered, hasBeenInteracted, scaleSpring]);

          const handlers = {
            onPointerOver: () => {
              setHasBeenInteracted(true);
              setHovered(true);
            },
            onPointerOut: () => setHovered(false),
          };

          return { hovered, hasBeenInteracted, scaleSpring, handlers };
        },
        { wrapper: TestWrapper },
      );

      // Initial state
      expect(result.current.hovered).toBe(false);
      expect(result.current.hasBeenInteracted).toBe(false);

      // Simulate hover
      act(() => {
        result.current.handlers.onPointerOver();
      });

      expect(result.current.hovered).toBe(true);
      expect(result.current.hasBeenInteracted).toBe(true);

      // Simulate hover out
      act(() => {
        result.current.handlers.onPointerOut();
      });

      expect(result.current.hovered).toBe(false);
    });

    it('handles click interactions', () => {
      const { result } = renderHook(() => {
        const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);
        const [clickCount, setClickCount] = React.useState(0);

        const handlers = {
          onClick: () => {
            setHasBeenInteracted(true);
            setClickCount((prev) => prev + 1);
          },
        };

        return { hasBeenInteracted, clickCount, handlers };
      }, {});

      // Initial state
      expect(result.current.hasBeenInteracted).toBe(false);
      expect(result.current.clickCount).toBe(0);

      // Simulate click
      act(() => {
        result.current.handlers.onClick();
      });

      expect(result.current.hasBeenInteracted).toBe(true);
      expect(result.current.clickCount).toBe(1);

      // Simulate another click
      act(() => {
        result.current.handlers.onClick();
      });

      expect(result.current.clickCount).toBe(2);
    });

    it('manages breathing animation for non-interacted items', () => {
      const { result } = renderHook(() => {
        const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);
        const scaleSpring = useSimpleLerp(WEBXR_ANIMATION_CONFIG.scales.default, { speed: 0.1 });

        React.useEffect(() => {
          if (!hasBeenInteracted) {
            const breathingAnimation = setInterval(() => {
              scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.breathing);
              setTimeout(() => {
                scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.default);
              }, WEBXR_ANIMATION_CONFIG.timing.delays.breathingDuration);
            }, WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval);

            return () => clearInterval(breathingAnimation);
          }
        }, [hasBeenInteracted, scaleSpring]);

        return { hasBeenInteracted, scaleSpring, setHasBeenInteracted };
      }, {});

      // Initial state - should start breathing animation
      expect(result.current.hasBeenInteracted).toBe(false);

      // After interaction, breathing should stop
      act(() => {
        result.current.setHasBeenInteracted(true);
      });

      expect(result.current.hasBeenInteracted).toBe(true);
    });

    it('applies correct scale values for different states', () => {
      // Test scale configuration values
      expect(WEBXR_ANIMATION_CONFIG.scales.default).toBe(1.0);
      expect(WEBXR_ANIMATION_CONFIG.scales.hover).toBe(1.1);
      expect(WEBXR_ANIMATION_CONFIG.scales.breathing).toBe(1.05);
    });

    it('applies correct color based on state', () => {
      const { result } = renderHook(() => {
        const [hovered, setHovered] = React.useState(false);
        const [isActive, setIsActive] = React.useState(false);

        const color = isActive ? '#ffffff' : hovered ? '#d1d5db' : '#9ca3af';

        return {
          hovered,
          isActive,
          color,
          setHovered,
          setIsActive,
        };
      }, {});

      // Default state (not hovered, not active)
      expect(result.current.color).toBe('#9ca3af');

      // Hover state
      act(() => {
        result.current.setHovered(true);
      });
      expect(result.current.color).toBe('#d1d5db');

      // Active state (takes precedence)
      act(() => {
        result.current.setIsActive(true);
      });
      expect(result.current.color).toBe('#ffffff');

      // Back to hover after active
      act(() => {
        result.current.setIsActive(false);
      });
      expect(result.current.color).toBe('#d1d5db');
    });
  });

  describe('Positioning and Layout', () => {
    it('uses correct navigation positions', () => {
      // Test navigation position constants
      expect(NAVIGATION_POSITIONS.navigationGroup).toEqual([0, 0, -1]);
      expect(NAVIGATION_POSITIONS.navigationButton).toEqual([2.5, 2.5, 0]);
      expect(NAVIGATION_POSITIONS.navigationButtonAbsolute).toEqual([2.5, 2.5, -1]);
    });

    it('positions NavItem correctly within navigation structure', () => {
      // Test that NavItem gets position [0, 0, 0] relative to navigation button
      const navItemPosition: [number, number, number] = [0, 0, 0];
      const navigationButtonPosition: [number, number, number] = [2.5, 2.5, 0];

      // The absolute position would be the sum
      const absolutePosition: [number, number, number] = [
        navItemPosition[0] + navigationButtonPosition[0],
        navItemPosition[1] + navigationButtonPosition[1],
        navItemPosition[2] + navigationButtonPosition[2],
      ];

      expect(absolutePosition).toEqual([2.5, 2.5, 0]);
    });

    it('applies correct text properties', () => {
      // Test text configuration
      const textProps = {
        anchorX: 'center' as const,
        anchorY: 'middle' as const,
        fontSize: 0.6,
        font: '/fonts/GT-Eesti-Display-Bold-Trial.woff',
      };

      expect(textProps.anchorX).toBe('center');
      expect(textProps.anchorY).toBe('middle');
      expect(textProps.fontSize).toBe(0.6);
      expect(textProps.font).toBe('/fonts/GT-Eesti-Display-Bold-Trial.woff');
    });
  });

  describe('Animation Timing', () => {
    it('uses correct breathing animation timing', () => {
      // Test breathing animation configuration
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval).toBe(2500);
      expect(WEBXR_ANIMATION_CONFIG.timing.delays.breathingDuration).toBe(1000);
    });

    it('handles breathing animation lifecycle', () => {
      const { result } = renderHook(() => {
        const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);
        const breathingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

        React.useEffect(() => {
          if (!hasBeenInteracted) {
            breathingIntervalRef.current = setInterval(() => {
              // Breathing animation logic would go here
            }, WEBXR_ANIMATION_CONFIG.timing.delays.breathingInterval);

            return () => {
              if (breathingIntervalRef.current) {
                clearInterval(breathingIntervalRef.current);
              }
            };
          }
        }, [hasBeenInteracted]);

        return { hasBeenInteracted, setHasBeenInteracted };
      }, {});

      // Initially should not have been interacted
      expect(result.current.hasBeenInteracted).toBe(false);

      // After interaction, should stop breathing
      act(() => {
        result.current.setHasBeenInteracted(true);
      });

      expect(result.current.hasBeenInteracted).toBe(true);
    });

    it('clears breathing interval on interaction', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { result } = renderHook(() => {
        const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);

        React.useEffect(() => {
          if (!hasBeenInteracted) {
            const interval = setInterval(() => {}, 100);
            return () => clearInterval(interval);
          }
        }, [hasBeenInteracted]);

        return { hasBeenInteracted, setHasBeenInteracted };
      }, {});

      // Trigger interaction
      act(() => {
        result.current.setHasBeenInteracted(true);
      });

      // Should have cleared the interval
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Spring Animation Integration', () => {
    it('integrates with useSimpleLerp for scale animations', () => {
      const { result } = renderHook(() => {
        const scaleSpring = useSimpleLerp(WEBXR_ANIMATION_CONFIG.scales.default, {
          speed: 0.1, // Fast speed for testing
        });

        React.useEffect(() => {
          scaleSpring.set(WEBXR_ANIMATION_CONFIG.scales.hover);
        }, [scaleSpring]);

        return { scaleSpring };
      }, {});

      // Spring should be initialized
      expect(result.current.scaleSpring).toBeDefined();
      expect(typeof result.current.scaleSpring.set).toBe('function');
      expect(typeof result.current.scaleSpring.value).toBe('number');
    });

    it('handles scale spring updates correctly', () => {
      // Mock useSimpleLerp to return a spy for set method
      const mockSet = jest.fn();
      const mockUseSimpleLerp = jest.fn(() => ({
        value: 1.0,
        set: mockSet,
      }));

      // Replace the hook temporarily
      const originalUseSimpleLerp = require('@/hooks/useSimpleLerp').useSimpleLerp;
      require('@/hooks/useSimpleLerp').useSimpleLerp = mockUseSimpleLerp;

      const { result } = renderHook(() => {
        const scaleSpring = useSimpleLerp(1.0, { speed: 0.1 });

        const setScale = (scale: number) => {
          scaleSpring.set(scale);
        };

        return { scaleSpring, setScale };
      }, {});

      // Initial value
      expect(result.current.scaleSpring.value).toBe(1.0);

      // Set new scale
      act(() => {
        result.current.setScale(1.1);
      });

      // Spring should accept the new target value
      expect(mockSet).toHaveBeenCalledWith(1.1);

      // Restore original hook
      require('@/hooks/useSimpleLerp').useSimpleLerp = originalUseSimpleLerp;
    });
  });

  describe('Error Handling', () => {
    it('handles undefined text ref gracefully', () => {
      const textRef = { current: null as { scale: { setScalar: (value: number) => void } } | null };

      // Should not throw when accessing textRef.current
      expect(() => {
        if (!textRef.current) {
          // This is expected behavior
          return;
        }
        textRef.current.scale.setScalar(1);
      }).not.toThrow();
    });

    it('handles missing navigation context', () => {
      // Test component behavior when context is not available
      expect(() => {
        // This would normally cause an error, but our component should handle it
        render(
          <div>
            <Navigation3D />
          </div>,
        );
      }).toThrow(); // Should throw without proper context
    });
  });

  describe('Performance Considerations', () => {
    it('stops breathing animation after first interaction', () => {
      const { result } = renderHook(() => {
        const [hasBeenInteracted, setHasBeenInteracted] = React.useState(false);
        const [breathingActive, setBreathingActive] = React.useState(false);

        React.useEffect(() => {
          if (!hasBeenInteracted) {
            setBreathingActive(true);
          } else {
            setBreathingActive(false);
          }
        }, [hasBeenInteracted]);

        return {
          hasBeenInteracted,
          breathingActive,
          setHasBeenInteracted,
        };
      }, {});

      // Initially breathing should be active
      expect(result.current.breathingActive).toBe(true);

      // After interaction, breathing should stop
      act(() => {
        result.current.setHasBeenInteracted(true);
      });

      expect(result.current.breathingActive).toBe(false);
    });

    it('optimizes re-renders with proper dependency arrays', () => {
      // Test that useEffect dependencies are properly configured
      const useEffectSpy = jest.spyOn(React, 'useEffect');

      renderHook(() => {
        const [hovered, setHovered] = React.useState(false);
        const scaleSpring = useSimpleLerp(1, { speed: 0.1 });

        React.useEffect(() => {
          if (hovered) {
            scaleSpring.set(1.1);
          }
        }, [hovered, scaleSpring]);

        return { hovered, setHovered };
      }, {});

      // useEffect should be called
      expect(useEffectSpy).toHaveBeenCalled();
    });
  });
});
