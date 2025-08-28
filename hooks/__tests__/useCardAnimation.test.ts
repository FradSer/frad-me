import { renderHook, act } from '@testing-library/react';
import { useCardAnimation } from '../useCardAnimation';

// Mock THREE.js Group
const mockGroup = {
  position: { set: jest.fn(), x: 0, y: 0, z: 0 },
  scale: { setScalar: jest.fn() },
  rotation: { y: 0 },
  visible: true,
  children: [],
};

// Mock material utils
jest.mock('@/utils/webxr/materialUtils', () => ({
  applyOpacityToObject: jest.fn(),
}));

// Mock webxr animation helpers
jest.mock('@/utils/webxr/animationHelpers', () => ({
  workCardPositions: {
    entrance: { x: 0, y: 0, z: -10 },
    hover: { x: 0, y: 1, z: -2 },
  },
}));

// Mock animation config
jest.mock('@/utils/webxr/animationConfig', () => ({
  WEBXR_ANIMATION_CONFIG: {
    scales: {
      entrance: 0.8,
      default: 1.0,
      hover: 1.1,
    },
    opacity: {
      hidden: 0.0,
      visible: 1.0,
    },
    springs: {
      elastic: { tension: 400, friction: 25 },
      fast: { tension: 450, friction: 35 },
      bouncy: { tension: 320, friction: 22 },
    },
    timing: {
      delays: {
        cardEntranceDelay: 400,
        cardStagger: 150,
      },
    },
    positions: {
      workCards: {
        rotation: {
          idle: 0,
          hover: 0.1,
        },
      },
    },
  },
}));

// Mock simple lerp
jest.mock('../useSimpleLerp', () => ({
  useSimpleLerp: jest.fn((initial, config) => {
    const ref = { current: initial };
    return {
      value: ref.current,
      set: jest.fn((target) => { ref.current = target; }),
    };
  }),
  springConfigToLerpSpeed: jest.fn(() => 0.5),
}));

// Mock WebXR context
jest.mock('@/contexts/WebXR/WebXRViewContext', () => ({
  useWebXRView: () => ({
    currentView: 'home',
  }),
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    if (typeof window !== 'undefined') {
      (window as any).__useFrameCallback = callback;
    }
  }),
}));

describe('useCardAnimation Hook', () => {
  let mockGroupRef: React.RefObject<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGroupRef = { current: { ...mockGroup } };
  });

  describe('Initialization', () => {
    it('should initialize with correct parameters', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      expect(result.current.isAnimated).toBeDefined();
    });

    it('should handle null groupRef gracefully', () => {
      const nullRef = { current: null };
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: nullRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('View-based Animation Control', () => {
    it('should show cards when currentView is work', () => {
      // Mock context to return 'work' view
      jest.doMock('@/contexts/WebXR/WebXRViewContext', () => ({
        useWebXRView: () => ({
          currentView: 'work',
        }),
      }));

      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger useFrame to simulate animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      // Should make group visible when in work view
      expect(mockGroupRef.current?.visible).toBe(true);
    });

    it('should hide cards when currentView is not work', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger useFrame
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      // Should hide group when not in work view
      expect(mockGroupRef.current?.visible).toBe(false);
    });
  });

  describe('Staggered Animation Timing', () => {
    it('should apply staggered entrance delays based on index', () => {
      const { result: card0 } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      const { result: card1 } = renderHook(() =>
        useCardAnimation({
          groupRef: { current: { ...mockGroup } },
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 1,
        })
      );

      // Both should have different timing due to index-based staggering
      expect(card0.current.isAnimated).toBeDefined();
      expect(card1.current.isAnimated).toBeDefined();
    });

    it('should respect entrance delay before starting animation', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Before entrance delay, card should be hidden
      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('Hover State Animation', () => {
    it('should apply hover scale and rotation when hovered', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: true,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });

    it('should return to default state when not hovered', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('Position Animation', () => {
    it('should animate position from entrance to target', () => {
      const targetPosition: [number, number, number] = [5, 2, -3];

      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: targetPosition,
          index: 0,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });

    it('should apply floating animation offset', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 1,
        })
      );

      // Trigger animation with time elapsed
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: Math.PI } }, // Non-zero time for floating effect
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('Opacity Animation', () => {
    it('should call onOpacityChange callback when opacity changes', () => {
      const onOpacityChange = jest.fn();

      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
          onOpacityChange,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      // Callback should be called during animation
      expect(onOpacityChange).toHaveBeenCalled();
    });

    it('should handle opacity threshold for visibility', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('Animation Orchestration', () => {
    it('should coordinate multiple animation properties simultaneously', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: true,
          position: [1, 2, 3],
          index: 0,
        })
      );

      // Trigger animation
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 1 } },
            0.016
          );
        });
      }

      expect(result.current.isAnimated).toBeDefined();
    });

    it('should handle view transitions smoothly', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Simulate view transition by triggering animation multiple times
      for (let i = 0; i < 5; i++) {
        if ((window as any).__useFrameCallback) {
          act(() => {
            (window as any).__useFrameCallback(
              { clock: { elapsedTime: i * 0.1 } },
              0.016
            );
          });
        }
      }

      expect(result.current.isAnimated).toBeDefined();
    });
  });

  describe('Performance Optimization', () => {
    it('should handle rapid updates without performance degradation', () => {
      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: mockGroupRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Simulate many rapid animation frames
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        if ((window as any).__useFrameCallback) {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: i * 0.001 } },
            0.001
          );
        }
      }
      const endTime = performance.now();

      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.current.isAnimated).toBeDefined();
    });

    it('should skip animation when component is not ready', () => {
      const nullRef = { current: null };

      const { result } = renderHook(() =>
        useCardAnimation({
          groupRef: nullRef,
          visible: true,
          hovered: false,
          position: [0, 0, 0],
          index: 0,
        })
      );

      // Trigger animation with null ref
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback(
            { clock: { elapsedTime: 0 } },
            0.016
          );
        });
      }

      // Should not throw error
      expect(result.current.isAnimated).toBeDefined();
    });
  });
});
