/**
 * Performance Monitor Tests
 *
 * Tests for WebXR performance tracking system
 */

import {
  PerformanceMonitor,
  QualityLevel,
  type RendererInfo,
} from '@/utils/webxr/performanceMonitor';

describe('PerformanceMonitor', () => {
  describe('FPS Tracking', () => {
    it('should initialize with zero FPS', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.getMetrics().fps).toBe(0);
    });

    it('should calculate FPS based on frame intervals', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();

      // Simulate 60 FPS (16.67ms per frame) over 1 second
      const frameCount = 60;
      for (let i = 0; i < frameCount; i++) {
        monitor.recordFrame(now + i * (1000 / 60));
      }

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeCloseTo(60, 0);
    });

    it('should calculate FPS for 30 FPS (33.33ms per frame)', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();

      // Simulate 30 FPS over 1 second
      const frameCount = 30;
      for (let i = 0; i < frameCount; i++) {
        monitor.recordFrame(now + i * (1000 / 30));
      }

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeCloseTo(30, 0);
    });

    it('should handle irregular frame intervals', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();

      // Record frames over 1 second with irregular timing
      monitor.recordFrame(now);
      monitor.recordFrame(now + 15);
      monitor.recordFrame(now + 32);
      monitor.recordFrame(now + 48);
      monitor.recordFrame(now + 65);
      monitor.recordFrame(now + 82);
      monitor.recordFrame(now + 100);

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeGreaterThan(0);
    });

    it('should require at least 2 frames to calculate FPS', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();

      monitor.recordFrame(now);

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBe(0);
    });

    it('should only use frames from the last 1 second', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();

      // Record 60 FPS frames for 2 seconds
      for (let i = 0; i < 120; i++) {
        monitor.recordFrame(now + i * (1000 / 60));
      }

      // FPS should still be ~60 (only counting recent frames)
      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeCloseTo(60, 0);
    });
  });

  describe('Quality Level Determination', () => {
    it('should return High quality for FPS >= 60', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();
      // Set up frames for 60+ FPS over 1 second
      for (let i = 0; i < 60; i++) {
        monitor.recordFrame(now + i * (1000 / 62)); // ~62 FPS
      }

      const metrics = monitor.getMetrics();
      expect(metrics.qualityLevel).toBe(QualityLevel.High);
    });

    it('should return Normal quality for 30 <= FPS < 60', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();
      // Set up frames for ~30 FPS over 1 second
      for (let i = 0; i < 30; i++) {
        monitor.recordFrame(now + i * (1000 / 30)); // ~30 FPS
      }

      const metrics = monitor.getMetrics();
      expect(metrics.qualityLevel).toBe(QualityLevel.Normal);
    });

    it('should return Reduced quality for FPS < 30', () => {
      const monitor = new PerformanceMonitor();
      const now = performance.now();
      // Set up frames for 25 FPS over 1 second
      for (let i = 0; i < 25; i++) {
        monitor.recordFrame(now + i * (1000 / 25)); // 25 FPS
      }

      const metrics = monitor.getMetrics();
      expect(metrics.qualityLevel).toBe(QualityLevel.Reduced);
    });

    it('should start with High quality level', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.getMetrics().qualityLevel).toBe(QualityLevel.High);
    });
  });

  describe('Draw Call Tracking', () => {
    it('should initialize with zero draw calls', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.getMetrics().drawCalls).toBe(0);
    });

    it('should track draw calls from renderer info', () => {
      const mockRendererInfo: RendererInfo = {
        render: { calls: 150, triangles: 3000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      const monitor = new PerformanceMonitor();
      monitor.updateFromRenderer(mockRendererInfo);

      const metrics = monitor.getMetrics();
      expect(metrics.drawCalls).toBe(150);
    });

    it('should update draw calls when renderer info changes', () => {
      const monitor = new PerformanceMonitor();
      const rendererInfo1: RendererInfo = {
        render: { calls: 100, triangles: 2000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      const rendererInfo2: RendererInfo = {
        render: { calls: 200, triangles: 4000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      monitor.updateFromRenderer(rendererInfo1);
      expect(monitor.getMetrics().drawCalls).toBe(100);

      monitor.updateFromRenderer(rendererInfo2);
      expect(monitor.getMetrics().drawCalls).toBe(200);
    });
  });

  describe('Memory Usage Tracking', () => {
    it('should initialize with zero memory usage', () => {
      const monitor = new PerformanceMonitor();
      const metrics = monitor.getMetrics();
      expect(metrics.memoryUsage.geometries).toBe(0);
      expect(metrics.memoryUsage.textures).toBe(0);
      expect(metrics.memoryUsage.programs).toBe(0);
    });

    it('should track memory usage from renderer info', () => {
      const mockRendererInfo: RendererInfo = {
        render: { calls: 100, triangles: 2000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      const monitor = new PerformanceMonitor();
      monitor.updateFromRenderer(mockRendererInfo);

      const metrics = monitor.getMetrics();
      expect(metrics.memoryUsage.geometries).toBe(5);
      expect(metrics.memoryUsage.textures).toBe(10);
      expect(metrics.memoryUsage.programs).toBe(2);
    });

    it('should update memory usage when renderer info changes', () => {
      const monitor = new PerformanceMonitor();
      const rendererInfo1: RendererInfo = {
        render: { calls: 100, triangles: 2000, points: 0, lines: 0 },
        memory: { geometries: 5, textures: 10, programs: 2 },
      };

      const rendererInfo2: RendererInfo = {
        render: { calls: 100, triangles: 2000, points: 0, lines: 0 },
        memory: { geometries: 10, textures: 20, programs: 4 },
      };

      monitor.updateFromRenderer(rendererInfo1);
      expect(monitor.getMetrics().memoryUsage.geometries).toBe(5);

      monitor.updateFromRenderer(rendererInfo2);
      expect(monitor.getMetrics().memoryUsage.geometries).toBe(10);
    });
  });

  describe('Development Logging', () => {
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
      const monitor = new PerformanceMonitor();

      monitor.logMetrics();

      expect(console.log).toHaveBeenCalled();
    });

    it('should not log metrics in production mode', () => {
      process.env.NODE_ENV = 'production';
      const monitor = new PerformanceMonitor();

      monitor.logMetrics();

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should include all metrics in development log', () => {
      process.env.NODE_ENV = 'development';
      const monitor = new PerformanceMonitor();

      monitor.logMetrics();

      const logCalls = jest.mocked(console.log).mock.calls;
      expect(logCalls.length).toBeGreaterThan(0);
      const logMessage = logCalls[0][0] as string;
      expect(logMessage).toContain('fps');
      expect(logMessage).toContain('qualityLevel');
      expect(logMessage).toContain('drawCalls');
      expect(logMessage).toContain('memoryUsage');
    });
  });

  describe('QualityLevel Enum', () => {
    it('should have correct numeric values', () => {
      expect(QualityLevel.High).toBe(60);
      expect(QualityLevel.Normal).toBe(45);
      expect(QualityLevel.Reduced).toBe(30);
    });
  });
});
