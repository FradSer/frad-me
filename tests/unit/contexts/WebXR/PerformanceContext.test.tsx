/**
 * PerformanceContext Tests
 *
 * Tests for WebXR performance context provider
 */

import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { PerformanceProvider, usePerformance } from '@/contexts/WebXR/PerformanceContext';
import {
  PerformanceMonitor,
  QualityLevel,
  type RendererInfo,
} from '@/utils/webxr/performanceMonitor';

describe('PerformanceContext', () => {
  describe('PerformanceProvider', () => {
    it('should provide performance context to children', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current).toBeDefined();
    });

    it('should initialize with zero FPS', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current.fps).toBe(0);
    });

    it('should initialize with High quality level', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current.qualityLevel).toBe(QualityLevel.High);
    });

    it('should initialize with zero draw calls', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current.drawCalls).toBe(0);
    });

    it('should initialize with zero memory usage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current.memoryUsage.geometries).toBe(0);
      expect(result.current.memoryUsage.textures).toBe(0);
      expect(result.current.memoryUsage.programs).toBe(0);
    });

    it('should provide full metrics object', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      expect(result.current.metrics).toEqual({
        fps: 0,
        qualityLevel: QualityLevel.High,
        drawCalls: 0,
        memoryUsage: {
          geometries: 0,
          textures: 0,
          programs: 0,
        },
      });
    });
  });

  describe('recordFrame', () => {
    it('should update FPS when recording frames', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      act(() => {
        const now = performance.now();
        for (let i = 0; i < 60; i++) {
          result.current.recordFrame(now + i * (1000 / 60));
        }
      });

      expect(result.current.fps).toBeCloseTo(60, 0);
    });

    it('should update quality level based on FPS', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      act(() => {
        const now = performance.now();
        for (let i = 0; i < 25; i++) {
          result.current.recordFrame(now + i * (1000 / 25)); // 25 FPS
        }
      });

      expect(result.current.qualityLevel).toBe(QualityLevel.Reduced);
    });
  });

  describe('updateFromRenderer', () => {
    it('should update draw calls from renderer info', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      const rendererInfo: RendererInfo = {
        render: { calls: 150, triangles: 3000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      act(() => {
        result.current.updateFromRenderer(rendererInfo);
      });

      expect(result.current.drawCalls).toBe(150);
    });

    it('should update memory usage from renderer info', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      const rendererInfo: RendererInfo = {
        render: { calls: 100, triangles: 2000, points: 0, lines: 0 },
        memory: { geometries: 10, textures: 20, programs: 4 },
      };

      act(() => {
        result.current.updateFromRenderer(rendererInfo);
      });

      expect(result.current.memoryUsage.geometries).toBe(10);
      expect(result.current.memoryUsage.textures).toBe(20);
      expect(result.current.memoryUsage.programs).toBe(4);
    });
  });

  describe('getMonitor', () => {
    it('should provide access to the underlying PerformanceMonitor instance', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      const monitor = result.current.getMonitor();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should return the same monitor instance across calls', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      const monitor1 = result.current.getMonitor();
      const monitor2 = result.current.getMonitor();

      expect(monitor1).toBe(monitor2);
    });
  });

  describe('usePerformance hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => usePerformance());
      }).toThrow('usePerformance must be used within a PerformanceProvider');
    });
  });

  describe('logMetrics', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      jest.restoreAllMocks();
    });

    it('should log metrics in development mode', () => {
      process.env.NODE_ENV = 'development';
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      act(() => {
        result.current.logMetrics();
      });

      expect(console.log).toHaveBeenCalled();
    });

    it('should not log metrics in production mode', () => {
      process.env.NODE_ENV = 'production';
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PerformanceProvider>{children}</PerformanceProvider>
      );

      const { result } = renderHook(() => usePerformance(), { wrapper });

      act(() => {
        result.current.logMetrics();
      });

      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
