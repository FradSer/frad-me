/**
 * @jest-environment jsdom
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';

// Mock Three.js and react-three-fiber
jest.mock('three', () => ({
  MathUtils: {
    lerp: jest.fn((a, b, t) => a + (b - a) * t),
  },
}));

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}));

describe('WebXR Animation Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useWebXRAnimation', () => {
    it('should create animation hook with valid preset', () => {
      const { useWebXRAnimation } = require('@/hooks/useWebXRAnimation');
      
      expect(() => {
        const { result } = renderHook(() => useWebXRAnimation('elastic', 0));
        expect(result.current).toBeDefined();
        expect(typeof result.current.value).toBe('number');
        expect(typeof result.current.set).toBe('function');
      }).not.toThrow();
    });

    it('should fallback to normal preset for invalid input', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { useWebXRAnimation } = require('@/hooks/useWebXRAnimation');
      
      expect(() => {
        renderHook(() => useWebXRAnimation('invalid_preset' as any, 0));
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid animation preset "invalid_preset"')
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('useAdaptiveAnimation', () => {
    it('should create adaptive animation hook', () => {
      const { useAdaptiveAnimation } = require('@/hooks/useWebXRAnimation');
      
      expect(() => {
        const { result } = renderHook(() => useAdaptiveAnimation('bouncy', 0));
        expect(result.current).toBeDefined();
        expect(typeof result.current.value).toBe('number');
        expect(typeof result.current.set).toBe('function');
      }).not.toThrow();
    });
  });
});