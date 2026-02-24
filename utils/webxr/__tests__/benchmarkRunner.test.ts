import * as THREE from 'three';
import {
  BENCHMARK_TARGETS,
  type BenchmarkConfig,
  type BenchmarkResults,
  BenchmarkRunner,
  type DrawCallMetrics,
  type FrameRateMetrics,
  type MemoryMetrics,
  type QualityMetrics,
  type ResponseTimeMetrics,
} from '@/utils/webxr/benchmarkRunner';

jest.useFakeTimers();

describe('BenchmarkRunner', () => {
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(1024, 768);
    renderer.setPixelRatio(1);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1024 / 768, 0.1, 1000);
    camera.position.z = 5;
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch {
      // Ignore if fake timers are not active
    }
    jest.useRealTimers();
    renderer.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => {
            mat.dispose();
          });
        } else if (object.material) {
          object.material.dispose();
        }
      } else if (object instanceof THREE.InstancedMesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
    });
    scene.clear();
  });

  describe('Constructor', () => {
    it('should initialize with default config', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      expect(runner.getDurationMs()).toBe(10000);
      expect(runner.getDeviceType()).toBe('vision-pro');
      expect(runner.isBenchmarkRunning()).toBe(false);
    });

    it('should initialize with custom config', () => {
      const config: Partial<BenchmarkConfig> = {
        durationMs: 5000,
        sampleIntervalMs: 100,
        warmupMs: 1000,
      };
      const runner = new BenchmarkRunner(renderer, scene, camera, 'quest', config);
      expect(runner.getDurationMs()).toBe(5000);
      expect(runner.getDeviceType()).toBe('quest');
    });
  });

  describe('Getter Methods', () => {
    it('should return correct duration', () => {
      const config: Partial<BenchmarkConfig> = {
        durationMs: 2000,
      };
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro', config);
      expect(runner.getDurationMs()).toBe(2000);
    });

    it('should return correct device type', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'quest');
      expect(runner.getDeviceType()).toBe('quest');
    });

    it('should return false for isBenchmarkRunning when not started', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      expect(runner.isBenchmarkRunning()).toBe(false);
    });
  });

  describe('recordResponseTime', () => {
    it('should record response time', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      runner.recordResponseTime(12.5);
    });

    it('should record multiple response times', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      runner.recordResponseTime(10);
      runner.recordResponseTime(12);
      runner.recordResponseTime(14);
    });
  });

  describe('generateReport', () => {
    it('should generate report with all fields', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      const mockResults: BenchmarkResults = {
        config: {
          deviceType: 'vision-pro',
          durationMs: 1000,
          sampleIntervalMs: 50,
        },
        frameRate: {
          averageFps: 60,
          minimumFps: 58,
          maximumFps: 62,
          frameTimeMs: 16.5,
          variance: 1,
          droppedFrames: 0,
        },
        drawCalls: {
          drawCalls: 10,
          triangles: 1000,
          instancedMeshes: 1,
          instancedMeshInstances: 5,
          drawCallsPerMesh: 2,
          instancingEfficiency: 0.9,
        },
        responseTime: {
          p50: 12,
          p95: 14,
          p99: 15,
          average: 13,
          samples: 10,
        },
        memory: {
          currentMb: 50,
          peakMb: 55,
          geometriesMb: 5,
          texturesMb: 40,
          programsMb: 5,
          hasLeaks: false,
        },
        quality: {
          ssim: 0.0,
          hasArtifacts: false,
          details: ['SSIM comparison requires baseline screenshots'],
        },
        passed: true,
        failures: [],
        timestamp: Date.now(),
      };

      const report = runner.generateReport(mockResults);

      expect(report.results).toBe(mockResults);
      expect(report.targets).toBe(BENCHMARK_TARGETS['vision-pro']);
      expect(report.passed).toBe(true);
      expect(report.summary).toContain('passed');
      expect(report.failures).toEqual([]);
      expect(report.recommendations).toBeDefined();
    });

    it('should generate report with failures when targets not met', () => {
      const runner = new BenchmarkRunner(renderer, scene, camera, 'vision-pro');
      const mockResults: BenchmarkResults = {
        config: {
          deviceType: 'vision-pro',
          durationMs: 1000,
          sampleIntervalMs: 50,
        },
        frameRate: {
          averageFps: 30,
          minimumFps: 25,
          maximumFps: 35,
          frameTimeMs: 33,
          variance: 3,
          droppedFrames: 5,
        },
        drawCalls: {
          drawCalls: 75,
          triangles: 5000,
          instancedMeshes: 1,
          instancedMeshInstances: 5,
          drawCallsPerMesh: 15,
          instancingEfficiency: 0.1,
        },
        responseTime: {
          p50: 30,
          p95: 40,
          p99: 50,
          average: 35,
          samples: 10,
        },
        memory: {
          currentMb: 200,
          peakMb: 200,
          geometriesMb: 50,
          texturesMb: 100,
          programsMb: 50,
          hasLeaks: true,
        },
        quality: {
          ssim: 0.8,
          hasArtifacts: true,
          details: ['Visual artifacts detected'],
        },
        passed: false,
        failures: ['FPS target not met', 'Draw calls exceed target'],
        timestamp: Date.now(),
      };

      const report = runner.generateReport(mockResults);

      expect(report.passed).toBe(false);
      expect(report.summary).toContain('failed');
      expect(report.failures.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('BENCHMARK_TARGETS', () => {
    it('should have Vision Pro targets', () => {
      const target = BENCHMARK_TARGETS['vision-pro'];
      expect(target.deviceType).toBe('vision-pro');
      expect(target.targetFps).toBe(60);
      expect(target.minFps).toBe(55);
      expect(target.maxFrameTimeMs).toBeCloseTo(16.67, 1);
      expect(target.maxDrawCalls).toBe(50);
      expect(target.maxResponseTimeMs).toBe(16);
      expect(target.maxMemoryMb).toBe(150);
    });

    it('should have Quest targets', () => {
      const target = BENCHMARK_TARGETS.quest;
      expect(target.deviceType).toBe('quest');
      expect(target.targetFps).toBe(45);
      expect(target.minFps).toBe(40);
      expect(target.maxFrameTimeMs).toBeCloseTo(22.2, 1);
      expect(target.maxDrawCalls).toBe(50);
      expect(target.maxResponseTimeMs).toBe(16);
      expect(target.maxMemoryMb).toBe(150);
    });

    it('should have desktop targets', () => {
      const target = BENCHMARK_TARGETS.desktop;
      expect(target.deviceType).toBe('desktop');
      expect(target.targetFps).toBe(30);
      expect(target.minFps).toBe(25);
      expect(target.maxFrameTimeMs).toBeCloseTo(33.3, 1);
      expect(target.maxDrawCalls).toBe(30);
      expect(target.maxResponseTimeMs).toBe(16);
      expect(target.maxMemoryMb).toBe(150);
    });
  });

  describe('Type Definitions', () => {
    it('should accept valid BenchmarkConfig', () => {
      const config: BenchmarkConfig = {
        deviceType: 'vision-pro',
        durationMs: 1000,
        sampleIntervalMs: 50,
      };
      expect(config.deviceType).toBe('vision-pro');
    });

    it('should accept BenchmarkConfig with optional fields', () => {
      const config: BenchmarkConfig = {
        deviceType: 'quest',
        durationMs: 1000,
        sampleIntervalMs: 50,
        warmupMs: 2000,
      };
      expect(config.warmupMs).toBe(2000);
    });

    it('should accept valid FrameRateMetrics', () => {
      const metrics: FrameRateMetrics = {
        averageFps: 60,
        minimumFps: 58,
        maximumFps: 62,
        frameTimeMs: 16.5,
        variance: 1,
        droppedFrames: 0,
      };
      expect(metrics.averageFps).toBe(60);
    });

    it('should accept valid DrawCallMetrics', () => {
      const metrics: DrawCallMetrics = {
        drawCalls: 10,
        triangles: 1000,
        instancedMeshes: 1,
        instancedMeshInstances: 5,
        drawCallsPerMesh: 2,
        instancingEfficiency: 0.9,
      };
      expect(metrics.drawCalls).toBe(10);
    });

    it('should accept valid ResponseTimeMetrics', () => {
      const metrics: ResponseTimeMetrics = {
        p50: 12,
        p95: 14,
        p99: 15,
        average: 13,
        samples: 10,
      };
      expect(metrics.p95).toBe(14);
    });

    it('should accept valid MemoryMetrics', () => {
      const metrics: MemoryMetrics = {
        currentMb: 50,
        peakMb: 55,
        geometriesMb: 5,
        texturesMb: 40,
        programsMb: 5,
        hasLeaks: false,
      };
      expect(metrics.hasLeaks).toBe(false);
    });

    it('should accept valid QualityMetrics', () => {
      const metrics: QualityMetrics = {
        ssim: 0.95,
        hasArtifacts: false,
        details: [],
      };
      expect(metrics.ssim).toBe(0.95);
    });

    it('should accept valid BenchmarkResults', () => {
      const results: BenchmarkResults = {
        config: {
          deviceType: 'vision-pro',
          durationMs: 1000,
          sampleIntervalMs: 50,
        },
        frameRate: {
          averageFps: 60,
          minimumFps: 58,
          maximumFps: 62,
          frameTimeMs: 16.5,
          variance: 1,
          droppedFrames: 0,
        },
        drawCalls: {
          drawCalls: 10,
          triangles: 1000,
          instancedMeshes: 1,
          instancedMeshInstances: 5,
          drawCallsPerMesh: 2,
          instancingEfficiency: 0.9,
        },
        responseTime: {
          p50: 12,
          p95: 14,
          p99: 15,
          average: 13,
          samples: 10,
        },
        memory: {
          currentMb: 50,
          peakMb: 55,
          geometriesMb: 5,
          texturesMb: 40,
          programsMb: 5,
          hasLeaks: false,
        },
        quality: {
          ssim: 0.95,
          hasArtifacts: false,
          details: [],
        },
        passed: true,
        failures: [],
        timestamp: Date.now(),
      };
      expect(results.passed).toBe(true);
    });
  });

  describe('DeviceType Type', () => {
    it('should accept "vision-pro" as valid DeviceType', () => {
      const deviceType: DeviceType = 'vision-pro';
      expect(deviceType).toBe('vision-pro');
    });

    it('should accept "quest" as valid DeviceType', () => {
      const deviceType: DeviceType = 'quest';
      expect(deviceType).toBe('quest');
    });

    it('should accept "desktop" as valid DeviceType', () => {
      const deviceType: DeviceType = 'desktop';
      expect(deviceType).toBe('desktop');
    });
  });
});
