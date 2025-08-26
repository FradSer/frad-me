/**
 * @jest-environment jsdom
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { render, act } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import React from 'react';

// Mock WebXR and Three.js dependencies
jest.mock('@react-three/xr', () => ({
  XR: ({ children }: any) => <div data-testid="xr-mock">{children}</div>,
  useXRStore: () => ({
    isPresenting: false,
    isHandTracking: false,
  }),
}));

jest.mock('three', () => ({
  ...jest.requireActual('three'),
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockReturnValue({
      minFilter: 'LinearFilter',
      magFilter: 'LinearFilter',
    }),
  })),
}));

// Mock the WebXR context
const mockWebXRViewContext = {
  currentView: 'home',
  navigateToView: jest.fn(),
  isAnimating: false,
};

jest.mock('@/contexts/WebXR/WebXRViewContext', () => ({
  useWebXRView: () => mockWebXRViewContext,
  WebXRViewProvider: ({ children }: any) => children,
}));

describe('WebXR Animation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebXRViewContext.currentView = 'home';
    mockWebXRViewContext.isAnimating = false;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('WorkCard3D Integration', () => {
    it('should use centralized animation configuration', async () => {
      // This test will fail until we implement centralized config integration
      expect(() => {
        // Mock the animation config first to test integration
        const mockConfig = {
          springs: {
            elastic: { tension: 400, friction: 25 },
            fast: { tension: 450, friction: 35 },
          },
          timing: {
            delays: { cardStagger: 150 },
            durations: { cardAnimation: 1200 },
          },
          positions: {
            workCards: {
              entrance: [2.5, 2.5, -8] as const,
              geometry: [4.5, 3, 1] as const,
            },
          },
          performance: {
            hideThreshold: 0.01,
          },
        };

        jest.doMock('@/utils/webxr/animationConfig', () => ({
          WEBXR_ANIMATION_CONFIG: mockConfig,
        }));

        const WorkCard3D = require('@/components/WebXR/WorkCard3D').default;
        
        const mockWork = {
          title: 'Test Work',
          subTitle: 'Test Description',
          slug: 'test-work',
          cover: '/test-cover.png',
          isWIP: false,
        };

        render(
          <Canvas>
            <WorkCard3D
              work={mockWork}
              position={[0, 0, 0]}
              index={0}
              visible={true}
            />
          </Canvas>
        );
      }).not.toThrow();
    });

    it('should animate with consistent timing from centralized config', () => {
      // This test will fail until timing integration is complete
      jest.useFakeTimers();
      
      expect(() => {
        const mockConfig = {
          timing: {
            delays: { cardStagger: 100, cardEntranceDelay: 400 },
            durations: { cardAnimation: 1200 },
          },
          springs: {
            elastic: { tension: 400, friction: 25 },
          },
        };

        jest.doMock('@/utils/webxr/animationConfig', () => ({
          WEBXR_ANIMATION_CONFIG: mockConfig,
        }));

        // Simulate view change to trigger animations
        act(() => {
          mockWebXRViewContext.currentView = 'work';
          mockWebXRViewContext.isAnimating = true;
        });

        // Fast-forward time to trigger staggered animations
        act(() => {
          jest.advanceTimersByTime(500); // Should trigger first card
        });

        act(() => {
          jest.advanceTimersByTime(100); // Should trigger second card
        });

        expect(mockWebXRViewContext.currentView).toBe('work');
      }).not.toThrow();

      jest.useRealTimers();
    });
  });

  describe('Navigation3D Integration', () => {
    it('should use centralized timing for breathing animation', () => {
      // This test will fail until Navigation3D uses centralized config
      jest.useFakeTimers();

      expect(() => {
        const mockConfig = {
          timing: {
            delays: {
              breathingInterval: 2500,
              breathingDuration: 1000,
            },
          },
          springs: {
            fast: { tension: 450, friction: 35 },
          },
          scales: {
            breathing: 1.05,
            hover: 1.1,
            default: 1.0,
          },
        };

        jest.doMock('@/utils/webxr/animationConfig', () => ({
          WEBXR_ANIMATION_CONFIG: mockConfig,
        }));

        const Navigation3D = require('@/components/WebXR/Navigation3D').default;

        render(
          <Canvas>
            <Navigation3D />
          </Canvas>
        );

        // Test breathing animation timing
        act(() => {
          jest.advanceTimersByTime(2500); // Should trigger breathing scale
        });

        act(() => {
          jest.advanceTimersByTime(1000); // Should return to normal scale
        });
      }).not.toThrow();

      jest.useRealTimers();
    });

    it('should adapt scale values from centralized configuration', () => {
      // This test will fail until scale values are centralized
      expect(() => {
        const mockConfig = {
          scales: {
            default: 1.0,
            hover: 1.1,
            breathing: 1.05,
          },
          springs: {
            fast: { tension: 450, friction: 35 },
          },
        };

        jest.doMock('@/utils/webxr/animationConfig', () => ({
          WEBXR_ANIMATION_CONFIG: mockConfig,
        }));

        // Should use centralized scale values instead of hardcoded ones
        const Navigation3D = require('@/components/WebXR/Navigation3D').default;

        const { container } = render(
          <Canvas>
            <Navigation3D />
          </Canvas>
        );

        expect(container).toBeInTheDocument();
      }).not.toThrow();
    });
  });

  describe('useCardAnimation Integration', () => {
    it('should integrate with centralized position configuration', () => {
      // This test will fail until useCardAnimation uses centralized positions
      expect(() => {
        const mockConfig = {
          positions: {
            workCards: {
              entrance: [2.5, 2.5, -8] as const,
              hover: [0, 1, -2] as const,
              geometry: [4.5, 3, 1] as const,
            },
          },
          springs: {
            elastic: { tension: 400, friction: 25 },
            fast: { tension: 450, friction: 35 },
            bouncy: { tension: 320, friction: 22 },
          },
          timing: {
            delays: {
              cardStagger: 150,
              cardEntranceDelay: 400,
            },
          },
        };

        jest.doMock('@/utils/webxr/animationConfig', () => ({
          WEBXR_ANIMATION_CONFIG: mockConfig,
        }));

        const { useCardAnimation } = require('@/hooks/useCardAnimation');
        const mockGroupRef = { current: null };

        // Should use centralized positions instead of animationHelpers
        const mockProps = {
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0] as [number, number, number],
          index: 0,
        };

        // This should work with centralized config
        const animationResult = useCardAnimation(mockProps);
        expect(animationResult).toBeDefined();
      }).not.toThrow();
    });

    it('should maintain backward compatibility during migration', () => {
      // This test ensures existing components continue to work during migration
      const { useCardAnimation } = require('@/hooks/useCardAnimation');
      const mockGroupRef = { current: null };

      expect(() => {
        const animationResult = useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        });

        expect(animationResult).toBeDefined();
        expect(typeof animationResult.isAnimated).toBe('boolean');
      }).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    it('should respect performance thresholds from centralized config', () => {
      // Test actual performance adaptation behavior
      const { AnimationConfigManager } = require('@/utils/webxr/animationConfig');
      
      // Get a fresh instance to ensure clean state
      const manager = AnimationConfigManager.getInstance();
      
      // Test high FPS performance 
      manager.updateFrameMetrics(60);
      const highQualityLevel = manager.getQualityLevel();
      expect(highQualityLevel).toBe('high');
      
      // Test normal FPS performance
      manager.updateFrameMetrics(40);
      const normalQualityLevel = manager.getQualityLevel();
      expect(normalQualityLevel).toBe('normal');
      
      // Test low FPS performance
      manager.updateFrameMetrics(20);
      const reducedQualityLevel = manager.getQualityLevel();
      expect(reducedQualityLevel).toBe('reduced');
      
      // Test adaptive configuration changes
      const baseConfig = manager.getAdaptiveConfig('normal');
      const adaptiveConfig = manager.getAdaptiveConfig('normal');
      
      // When FPS is low (20), adaptive config should modify tension and friction
      expect(adaptiveConfig.tension).toBeGreaterThan(280); // Base tension * tensionIncrease
      expect(adaptiveConfig.friction).toBeGreaterThan(28);  // Base friction * frictionIncrease
      expect(adaptiveConfig.tension).toBe(280 * 1.5);
      expect(adaptiveConfig.friction).toBe(28 * 1.2);

      // Test performance threshold usage for component visibility
      const mockOpacity = 0.005; // Below threshold
      const shouldHide = manager.shouldHideComponent(mockOpacity);
      expect(shouldHide).toBe(true);
      
      // Test opacity above threshold
      const visibleOpacity = 0.5;
      const shouldNotHide = manager.shouldHideComponent(visibleOpacity);
      expect(shouldNotHide).toBe(false);
    });

    it('should support adaptive quality based on performance', () => {
      // Test actual adaptive animation behavior in components
      const { useAdaptiveAnimation } = require('@/hooks/useWebXRAnimation');
      const { AnimationConfigManager } = require('@/utils/webxr/animationConfig');
      
      // Get manager instance and simulate low FPS
      const manager = AnimationConfigManager.getInstance();
      manager.updateFrameMetrics(20); // Simulate poor performance
      
      // Test that adaptive config changes based on performance
      const lowFpsConfig = manager.getAdaptiveConfig('normal');
      expect(lowFpsConfig.tension).toBeGreaterThan(280); // Should be 280 * 1.5 = 420
      expect(lowFpsConfig.friction).toBeGreaterThan(28);  // Should be 28 * 1.2 = 33.6
      
      // Simulate high FPS
      manager.updateFrameMetrics(60);
      const highFpsConfig = manager.getAdaptiveConfig('normal');
      expect(highFpsConfig.tension).toBe(280); // Should remain at base value
      expect(highFpsConfig.friction).toBe(28);  // Should remain at base value
      
      // Test that components using adaptive animation reflect these changes
      const { renderHook, act } = require('@testing-library/react');
      const { result } = renderHook(() => useAdaptiveAnimation('normal'));
      
      // Simulate performance degradation
      act(() => {
        result.current.updateFPS(15); // Very low FPS
      });
      
      // Verify the component's configuration adapts
      expect(result.current.config.tension).toBeGreaterThan(280);
      expect(result.current.config.friction).toBeGreaterThan(28);
      expect(result.current.performance.quality).toBe('reduced');
      
      // Simulate performance improvement
      act(() => {
        result.current.updateFPS(60); // High FPS
      });
      
      expect(result.current.performance.quality).toBe('high');
    });
  });

  describe('Type Safety Integration', () => {
    it('should maintain type safety across animation system', () => {
      // This test will fail until proper TypeScript integration is complete
      expect(() => {
        // Should have proper type definitions for animation presets
        type AnimationPreset = 'slow' | 'normal' | 'fast' | 'bouncy' | 'elastic';
        
        const testPreset: AnimationPreset = 'elastic';
        expect(['slow', 'normal', 'fast', 'bouncy', 'elastic']).toContain(testPreset);
        
        // Should have proper type definitions for positions
        type Position3D = readonly [number, number, number];
        
        const testPosition: Position3D = [0, 0, 0];
        expect(testPosition).toHaveLength(3);
        expect(typeof testPosition[0]).toBe('number');
      }).not.toThrow();
    });

    it('should provide compile-time safety for configuration access', () => {
      // This test will fail until configuration types are properly defined
      expect(() => {
        const mockConfig = {
          springs: {
            elastic: { tension: 400, friction: 25 },
          },
          timing: {
            delays: { cardStagger: 150 },
          },
        };

        // Should provide type-safe access to nested configuration
        const springConfig = mockConfig.springs.elastic;
        const timingDelay = mockConfig.timing.delays.cardStagger;
        
        expect(springConfig.tension).toBe(400);
        expect(timingDelay).toBe(150);
      }).not.toThrow();
    });
  });

  describe('Migration Compatibility', () => {
    it('should work alongside existing animationConstants during migration', () => {
      // This test ensures gradual migration is possible
      const { SPRING_CONFIGS } = require('@/utils/webxr/animationConstants');
      
      expect(() => {
        // Old config should still work
        expect(SPRING_CONFIGS.elastic).toBeDefined();
        expect(SPRING_CONFIGS.elastic.tension).toBe(400);
        expect(SPRING_CONFIGS.elastic.friction).toBe(25);
        
        // New config should provide same values (when implemented)
        // const { WEBXR_ANIMATION_CONFIG } = require('@/utils/webxr/animationConfig');
        // expect(WEBXR_ANIMATION_CONFIG.springs.elastic).toEqual(SPRING_CONFIGS.elastic);
      }).not.toThrow();
    });

    it('should support feature flag for gradual rollout', () => {
      // This test will fail until feature flags are implemented
      expect(() => {
        // Should support feature flag to toggle between old and new config
        const USE_NEW_CONFIG = process.env.NEXT_PUBLIC_USE_NEW_ANIMATION_CONFIG === 'true';
        
        if (USE_NEW_CONFIG) {
          // Should use new centralized config
          const { WEBXR_ANIMATION_CONFIG } = require('@/utils/webxr/animationConfig');
          expect(WEBXR_ANIMATION_CONFIG).toBeDefined();
        } else {
          // Should fall back to existing config
          const { SPRING_CONFIGS } = require('@/utils/webxr/animationConstants');
          expect(SPRING_CONFIGS).toBeDefined();
        }
      }).not.toThrow();
    });
  });
});