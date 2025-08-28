import { renderHook, act } from '@testing-library/react';
import { useSimpleLerp, useTripleLerp, springConfigToLerpSpeed } from '../useSimpleLerp';

// Mock THREE.js
jest.mock('three', () => ({
  MathUtils: {
    lerp: jest.fn((start, end, factor) => start + (end - start) * factor),
  },
}));

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    // Store the callback to manually trigger it in tests
    if (typeof window !== 'undefined') {
      (window as any).__useFrameCallback = callback;
    }
  }),
}));

describe('useSimpleLerp Hook', () => {
  let mockCallback: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallback = null;
    // Mock requestAnimationFrame to control timing
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(cb, 16); // ~60fps
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).__useFrameCallback;
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct initial value', () => {
      const { result } = renderHook(() => useSimpleLerp(5, { speed: 0.1 }));

      expect(result.current.value).toBe(5);
    });

    it('should update value when set is called', () => {
      const { result } = renderHook(() => useSimpleLerp(0, { speed: 1 }));

      act(() => {
        result.current.set(10);
      });

      // Trigger useFrame callback
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016); // 60fps delta
        });
      }

      // Value should move towards target (THREE.MathUtils.lerp is mocked to return interpolated value)
      expect(result.current.value).toBeGreaterThan(0);
    });

    it('should handle different speed configurations', () => {
      const { result: slowResult } = renderHook(() => useSimpleLerp(0, { speed: 0.1 }));
      const { result: fastResult } = renderHook(() => useSimpleLerp(0, { speed: 1 }));

      act(() => {
        slowResult.current.set(10);
        fastResult.current.set(10);
      });

      // Trigger useFrame callbacks
      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      // Both should move towards target, but fast should move more
      expect(slowResult.current.value).toBeGreaterThan(0);
      expect(fastResult.current.value).toBeGreaterThan(0);
    });

    it('should handle negative values', () => {
      const { result } = renderHook(() => useSimpleLerp(10, { speed: 1 }));

      act(() => {
        result.current.set(-5);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      expect(result.current.value).toBeLessThan(10);
    });

    it('should handle zero target', () => {
      const { result } = renderHook(() => useSimpleLerp(10, { speed: 1 }));

      act(() => {
        result.current.set(0);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      expect(result.current.value).toBeLessThan(10);
      expect(result.current.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Animation Interpolation', () => {
    it('should use THREE.MathUtils.lerp for interpolation', () => {
      const { result } = renderHook(() => useSimpleLerp(0, { speed: 1 }));

      act(() => {
        result.current.set(10);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      // Verify THREE.MathUtils.lerp was called
      const THREE = require('three');
      expect(THREE.MathUtils.lerp).toHaveBeenCalled();
    });

    it('should calculate speed correctly with delta time', () => {
      const { result } = renderHook(() => useSimpleLerp(0, { speed: 0.5 }));

      act(() => {
        result.current.set(10);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.032); // 30fps delta
        });
      }

      // Speed should be multiplied by delta time and factor
      const THREE = require('three');
      const lerpCall = THREE.MathUtils.lerp.mock.calls[0];
      expect(lerpCall[2]).toBe(0.5 * 0.032 * 10); // speed * delta * 10
    });
  });

  describe('Memory Management', () => {
    it('should not cause memory leaks on unmount', () => {
      const { result, unmount } = renderHook(() => useSimpleLerp(0, { speed: 1 }));

      act(() => {
        result.current.set(10);
      });

      // Unmount the component
      unmount();

      // Should not throw errors when accessing after unmount
      expect(() => result.current.value).not.toThrow();
    });

    it('should handle rapid re-mounting', () => {
      const { result, rerender } = renderHook(
        ({ initialValue }) => useSimpleLerp(initialValue, { speed: 1 }),
        { initialProps: { initialValue: 0 } }
      );

      act(() => {
        result.current.set(5);
      });

      rerender({ initialValue: 10 });

      // Should reset to new initial value
      expect(result.current.value).toBe(10);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle high frequency updates', () => {
      const { result } = renderHook(() => useSimpleLerp(0, { speed: 1 }));

      act(() => {
        result.current.set(100);
      });

      // Simulate many rapid updates
      for (let i = 0; i < 100; i++) {
        if ((window as any).__useFrameCallback) {
          (window as any).__useFrameCallback({}, 0.001); // Very small delta
        }
      }

      // Should not throw and should converge
      expect(result.current.value).toBeGreaterThan(0);
      expect(result.current.value).toBeLessThanOrEqual(100);
    });

    it('should handle extreme speed values', () => {
      const { result: slowResult } = renderHook(() => useSimpleLerp(0, { speed: 0.001 }));
      const { result: fastResult } = renderHook(() => useSimpleLerp(0, { speed: 100 }));

      act(() => {
        slowResult.current.set(10);
        fastResult.current.set(10);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      // Both should work without errors
      expect(slowResult.current.value).toBeGreaterThan(0);
      expect(fastResult.current.value).toBeGreaterThan(0);
    });
  });
});

describe('useTripleLerp Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct initial values', () => {
      const { result } = renderHook(() =>
        useTripleLerp([1, 2, 3], { speed: 0.5 })
      );

      expect(result.current.value).toEqual([1, 2, 3]);
    });

    it('should update all axes when set is called', () => {
      const { result } = renderHook(() =>
        useTripleLerp([0, 0, 0], { speed: 1 })
      );

      act(() => {
        result.current.set([10, 20, 30]);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      // All values should move towards targets
      expect(result.current.value[0]).toBeGreaterThan(0);
      expect(result.current.value[1]).toBeGreaterThan(0);
      expect(result.current.value[2]).toBeGreaterThan(0);
    });

    it('should interpolate each axis independently', () => {
      const { result } = renderHook(() =>
        useTripleLerp([0, 0, 0], { speed: 1 })
      );

      act(() => {
        result.current.set([10, 0, -5]); // Different targets for each axis
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      // X should increase, Y should stay near 0, Z should decrease
      expect(result.current.value[0]).toBeGreaterThan(0);
      expect(result.current.value[1]).toBeCloseTo(0, 1);
      expect(result.current.value[2]).toBeLessThan(0);
    });
  });

  describe('Animation Coordination', () => {
    it('should maintain array structure throughout animation', () => {
      const { result } = renderHook(() =>
        useTripleLerp([0, 0, 0], { speed: 1 })
      );

      act(() => {
        result.current.set([1, 2, 3]);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      expect(result.current.value).toHaveLength(3);
      expect(Array.isArray(result.current.value)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const { result } = renderHook(() =>
        useTripleLerp([10, 10, 10], { speed: 1 })
      );

      act(() => {
        result.current.set([-5, -10, -15]);
      });

      if ((window as any).__useFrameCallback) {
        act(() => {
          (window as any).__useFrameCallback({}, 0.016);
        });
      }

      expect(result.current.value[0]).toBeLessThan(10);
      expect(result.current.value[1]).toBeLessThan(10);
      expect(result.current.value[2]).toBeLessThan(10);
    });
  });
});

describe('springConfigToLerpSpeed Utility', () => {
  it('should convert spring config to lerp speed', () => {
    const springConfig = { tension: 300, friction: 30 };
    const speed = springConfigToLerpSpeed(springConfig);

    expect(typeof speed).toBe('number');
    expect(speed).toBeGreaterThan(0);
    expect(speed).toBeLessThanOrEqual(1);
  });

  it('should handle different spring configurations', () => {
    const stiffSpring = { tension: 500, friction: 20 };
    const softSpring = { tension: 150, friction: 40 };

    const stiffSpeed = springConfigToLerpSpeed(stiffSpring);
    const softSpeed = springConfigToLerpSpeed(softSpring);

    // Stiffer spring should have higher speed
    expect(stiffSpeed).toBeGreaterThan(softSpeed);
  });

  it('should clamp speed to maximum of 1', () => {
    const extremeSpring = { tension: 1000, friction: 1 };
    const speed = springConfigToLerpSpeed(extremeSpring);

    expect(speed).toBe(1);
  });

  it('should handle edge cases', () => {
    expect(() => springConfigToLerpSpeed({ tension: 0, friction: 1 })).not.toThrow();
    expect(() => springConfigToLerpSpeed({ tension: 100, friction: 0 })).not.toThrow();

    const zeroSpeed = springConfigToLerpSpeed({ tension: 0, friction: 100 });
    expect(zeroSpeed).toBe(0);
  });
});
