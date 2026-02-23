/**
 * Benchmark Runner
 *
 * Executes performance benchmarks for WebXR components.
 * Measures metrics over specified durations and generates performance reports.
 */

import * as THREE from 'three';
import {
  type PerformanceMetrics,
  PerformanceMonitor,
  QualityLevel,
  type RendererInfo,
} from '@/utils/webxr/performanceMonitor';

export type DeviceType = 'vision-pro' | 'quest' | 'desktop';

export interface BenchmarkConfig {
  deviceType: DeviceType;
  durationMs: number;
  sampleIntervalMs: number;
  warmupMs?: number;
}

export interface BenchmarkTarget {
  deviceType: DeviceType;
  targetFps: number;
  minFps: number;
  maxFrameTimeMs: number;
  maxDrawCalls: number;
  maxResponseTimeMs: number;
  maxMemoryMb: number;
}

export interface FrameRateMetrics {
  averageFps: number;
  minimumFps: number;
  maximumFps: number;
  frameTimeMs: number;
  variance: number;
  droppedFrames: number;
}

export interface DrawCallMetrics {
  drawCalls: number;
  triangles: number;
  instancedMeshes: number;
  instancedMeshInstances: number;
  drawCallsPerMesh: number;
  instancingEfficiency: number;
}

export interface ResponseTimeMetrics {
  p50: number;
  p95: number;
  p99: number;
  average: number;
  samples: number;
}

export interface MemoryMetrics {
  currentMb: number;
  peakMb: number;
  geometriesMb: number;
  texturesMb: number;
  programsMb: number;
  hasLeaks: boolean;
}

export interface QualityMetrics {
  ssim: number;
  hasArtifacts: boolean;
  details: string[];
}

export interface BenchmarkResults {
  config: BenchmarkConfig;
  frameRate: FrameRateMetrics;
  drawCalls: DrawCallMetrics;
  responseTime: ResponseTimeMetrics;
  memory: MemoryMetrics;
  quality: QualityMetrics;
  passed: boolean;
  failures: string[];
  timestamp: number;
}

export interface PerformanceReport {
  results: BenchmarkResults;
  targets: BenchmarkTarget;
  passed: boolean;
  summary: string;
  failures: string[];
  recommendations: string[];
}

export const BENCHMARK_TARGETS: Record<DeviceType, BenchmarkTarget> = {
  'vision-pro': {
    deviceType: 'vision-pro',
    targetFps: 60,
    minFps: 55,
    maxFrameTimeMs: 16.67,
    maxDrawCalls: 50,
    maxResponseTimeMs: 16,
    maxMemoryMb: 150,
  },
  quest: {
    deviceType: 'quest',
    targetFps: 45,
    minFps: 40,
    maxFrameTimeMs: 22.2,
    maxDrawCalls: 50,
    maxResponseTimeMs: 16,
    maxMemoryMb: 150,
  },
  desktop: {
    deviceType: 'desktop',
    targetFps: 30,
    minFps: 25,
    maxFrameTimeMs: 33.3,
    maxDrawCalls: 30,
    maxResponseTimeMs: 16,
    maxMemoryMb: 150,
  },
};

const DEFAULT_CONFIG: Omit<BenchmarkConfig, 'deviceType'> = {
  durationMs: 10000,
  sampleIntervalMs: 100,
  warmupMs: 2000,
};

export class BenchmarkRunner {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private config: BenchmarkConfig;
  private monitor: PerformanceMonitor;
  private frameTimestamps: number[] = [];
  private drawCallSamples: number[] = [];
  private responseTimes: number[] = [];
  private memorySnapshots: number[] = [];
  private isRunning = false;
  private animationFrameId: number | null = null;
  private startTime = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    deviceType: DeviceType,
    config: Partial<BenchmarkConfig> = {},
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.config = {
      deviceType,
      ...DEFAULT_CONFIG,
      ...config,
    };
    this.monitor = new PerformanceMonitor();
  }

  private shouldRun(): boolean {
    const now = performance.now();
    const elapsed = now - this.startTime;
    return elapsed < this.config.durationMs;
  }

  private renderFrame(): void {
    if (!this.shouldRun()) {
      return;
    }

    const timestamp = performance.now();
    this.frameTimestamps.push(timestamp);
    this.monitor.recordFrame(timestamp);

    const info = this.renderer.info;
    this.drawCallSamples.push(info.render.calls);

    const memInfo = this.renderer.info.memory;
    const estimatedMb = this.estimateMemoryMb(memInfo);
    this.memorySnapshots.push(estimatedMb);

    this.animationFrameId = requestAnimationFrame(() => this.renderFrame());
  }

  private estimateMemoryMb(memInfo: THREE.WebGLInfo['memory']): number {
    const geometryBytes = memInfo.geometries * 1024;
    const textureBytes = memInfo.textures * 1024 * 8;
    const programBytes = ((memInfo as { programs?: number }).programs ?? 0) * 512;
    return (geometryBytes + textureBytes + programBytes) / (1024 * 1024);
  }

  private measureFrameRate(): FrameRateMetrics {
    if (this.frameTimestamps.length < 2) {
      return {
        averageFps: 0,
        minimumFps: 0,
        maximumFps: 0,
        frameTimeMs: 0,
        variance: 0,
        droppedFrames: 0,
      };
    }

    const frameIntervals: number[] = [];
    for (let i = 1; i < this.frameTimestamps.length; i++) {
      frameIntervals.push(this.frameTimestamps[i] - this.frameTimestamps[i - 1]);
    }

    const averageInterval =
      frameIntervals.reduce((sum, interval) => sum + interval, 0) / frameIntervals.length;
    const averageFps = averageInterval > 0 ? 1000 / averageInterval : 0;

    const fpsValues = frameIntervals.map((interval) => (interval > 0 ? 1000 / interval : 0));
    const minimumFps = Math.min(...fpsValues);
    const maximumFps = Math.max(...fpsValues);

    const frameTimeMs = averageInterval;

    const fpsVariance =
      fpsValues.reduce((sum, fps) => sum + (fps - averageFps) ** 2, 0) / fpsValues.length;

    const droppedFrames = fpsValues.filter(
      (fps) => fps < BENCHMARK_TARGETS[this.config.deviceType].minFps,
    ).length;

    return {
      averageFps,
      minimumFps,
      maximumFps,
      frameTimeMs,
      variance: Math.sqrt(fpsVariance),
      droppedFrames,
    };
  }

  private measureDrawCalls(): DrawCallMetrics {
    if (this.drawCallSamples.length === 0) {
      return {
        drawCalls: 0,
        triangles: 0,
        instancedMeshes: 0,
        instancedMeshInstances: 0,
        drawCallsPerMesh: 0,
        instancingEfficiency: 0,
      };
    }

    const averageDrawCalls =
      this.drawCallSamples.reduce((sum, calls) => sum + calls, 0) / this.drawCallSamples.length;

    let instancedMeshCount = 0;
    let instancedMeshInstances = 0;
    let meshCount = 0;

    this.scene.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) {
        instancedMeshCount++;
        instancedMeshInstances += object.count;
      } else if (object instanceof THREE.Mesh) {
        meshCount++;
      }
    });

    const drawCallsPerMesh = meshCount > 0 ? averageDrawCalls / meshCount : 0;

    let instancingEfficiency = 0;
    if (instancedMeshCount > 0) {
      const maxCapacity = instancedMeshCount * 50;
      instancingEfficiency = maxCapacity > 0 ? instancedMeshInstances / maxCapacity : 0;
    }

    return {
      drawCalls: Math.round(averageDrawCalls),
      triangles: this.renderer.info.render.triangles,
      instancedMeshes: instancedMeshCount,
      instancedMeshInstances,
      drawCallsPerMesh,
      instancingEfficiency,
    };
  }

  private measureResponseTime(): ResponseTimeMetrics {
    if (this.responseTimes.length === 0) {
      return {
        p50: 0,
        p95: 0,
        p99: 0,
        average: 0,
        samples: 0,
      };
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const average = sorted.reduce((sum, time) => sum + time, 0) / sorted.length;

    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    return {
      p50: sorted[p50Index],
      p95: sorted[p95Index],
      p99: sorted[p99Index],
      average,
      samples: sorted.length,
    };
  }

  private measureMemory(): MemoryMetrics {
    if (this.memorySnapshots.length === 0) {
      return {
        currentMb: 0,
        peakMb: 0,
        geometriesMb: 0,
        texturesMb: 0,
        programsMb: 0,
        hasLeaks: false,
      };
    }

    const currentMb = this.memorySnapshots[this.memorySnapshots.length - 1];
    const peakMb = Math.max(...this.memorySnapshots);

    const memInfo = this.renderer.info.memory;
    const geometriesMb = (memInfo.geometries * 1024) / (1024 * 1024);
    const texturesMb = (memInfo.textures * 1024 * 8) / (1024 * 1024);
    const programsMb = ((memInfo as { programs?: number }).programs ?? 0 * 512) / (1024 * 1024);

    const hasLeaks = this.detectMemoryLeaks();

    return {
      currentMb,
      peakMb,
      geometriesMb,
      texturesMb,
      programsMb,
      hasLeaks,
    };
  }

  private detectMemoryLeaks(): boolean {
    if (this.memorySnapshots.length < 10) {
      return false;
    }

    const firstQuartile = this.memorySnapshots.slice(
      0,
      Math.floor(this.memorySnapshots.length / 4),
    );
    const lastQuartile = this.memorySnapshots.slice(-Math.floor(this.memorySnapshots.length / 4));

    const firstAvg = firstQuartile.reduce((sum, val) => sum + val, 0) / firstQuartile.length;
    const lastAvg = lastQuartile.reduce((sum, val) => sum + val, 0) / lastQuartile.length;

    return lastAvg - firstAvg > 10;
  }

  private measureQuality(): QualityMetrics {
    return {
      ssim: 0.0,
      hasArtifacts: false,
      details: ['SSIM comparison requires baseline screenshots'],
    };
  }

  private validateAgainstTargets(results: BenchmarkResults, targets: BenchmarkTarget): string[] {
    const failures: string[] = [];

    if (results.frameRate.averageFps < targets.targetFps) {
      failures.push(
        `FPS target not met: ${results.frameRate.averageFps.toFixed(2)} < ${targets.targetFps}`,
      );
    }

    if (results.frameRate.minimumFps < targets.minFps) {
      failures.push(
        `Minimum FPS not met: ${results.frameRate.minimumFps.toFixed(2)} < ${targets.minFps}`,
      );
    }

    if (results.frameRate.frameTimeMs > targets.maxFrameTimeMs) {
      failures.push(
        `Frame time exceeds target: ${results.frameRate.frameTimeMs.toFixed(2)}ms > ${targets.maxFrameTimeMs}ms`,
      );
    }

    if (results.drawCalls.drawCalls > targets.maxDrawCalls) {
      failures.push(
        `Draw calls exceed target: ${results.drawCalls.drawCalls} > ${targets.maxDrawCalls}`,
      );
    }

    if (results.responseTime.p95 > targets.maxResponseTimeMs) {
      failures.push(
        `Response time exceeds target: ${results.responseTime.p95.toFixed(2)}ms > ${targets.maxResponseTimeMs}ms`,
      );
    }

    if (results.memory.peakMb > targets.maxMemoryMb) {
      failures.push(
        `Memory usage exceeds target: ${results.memory.peakMb.toFixed(2)}MB > ${targets.maxMemoryMb}MB`,
      );
    }

    if (results.memory.hasLeaks) {
      failures.push('Memory leak detected');
    }

    if (results.frameRate.droppedFrames > 0) {
      failures.push(`${results.frameRate.droppedFrames} dropped frames detected`);
    }

    return failures;
  }

  private generateRecommendations(results: BenchmarkResults, targets: BenchmarkTarget): string[] {
    const recommendations: string[] = [];

    if (results.frameRate.averageFps < targets.targetFps) {
      recommendations.push('Consider reducing animation complexity or particle count');
    }

    if (results.drawCalls.drawCalls > targets.maxDrawCalls) {
      recommendations.push('Draw calls are high - verify InstancedMesh is being used');
      recommendations.push('Consider implementing visibility culling');
    }

    if (results.drawCalls.instancingEfficiency < 0.7) {
      recommendations.push(
        `Instancing efficiency is low (${(results.drawCalls.instancingEfficiency * 100).toFixed(1)}%)`,
      );
    }

    if (results.memory.peakMb > targets.maxMemoryMb) {
      recommendations.push('Consider reducing texture resolution');
      recommendations.push('Implement texture compression');
    }

    if (results.memory.hasLeaks) {
      recommendations.push('Review resource disposal - memory leak detected');
    }

    if (results.responseTime.p95 > targets.maxResponseTimeMs) {
      recommendations.push('Event handlers may be blocking - review main thread work');
    }

    if (recommendations.length === 0) {
      recommendations.push('All performance targets met - excellent!');
    }

    return recommendations;
  }

  async start(): Promise<BenchmarkResults> {
    if (this.isRunning) {
      throw new Error('Benchmark is already running');
    }

    this.isRunning = true;
    this.frameTimestamps = [];
    this.drawCallSamples = [];
    this.responseTimes = [];
    this.memorySnapshots = [];

    if (this.config.warmupMs) {
      await this.warmup();
    }

    this.startTime = performance.now();
    this.renderFrame();

    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.shouldRun()) {
          clearInterval(checkInterval);
          resolve(undefined);
        }
      }, this.config.sampleIntervalMs);
    });

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isRunning = false;

    return this.collectResults();
  }

  private async warmup(): Promise<void> {
    const warmupFrames = 30;
    for (let i = 0; i < warmupFrames; i++) {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    }
  }

  private collectResults(): BenchmarkResults {
    const frameRate = this.measureFrameRate();
    const drawCalls = this.measureDrawCalls();
    const responseTime = this.measureResponseTime();
    const memory = this.measureMemory();
    const quality = this.measureQuality();

    const targets = BENCHMARK_TARGETS[this.config.deviceType];
    const failures = this.validateAgainstTargets(
      {
        config: this.config,
        frameRate,
        drawCalls,
        responseTime,
        memory,
        quality,
        passed: false,
        failures: [],
        timestamp: Date.now(),
      },
      targets,
    );

    return {
      config: { ...this.config },
      frameRate,
      drawCalls,
      responseTime,
      memory,
      quality,
      passed: failures.length === 0,
      failures,
      timestamp: Date.now(),
    };
  }

  generateReport(results: BenchmarkResults): PerformanceReport {
    const targets = BENCHMARK_TARGETS[results.config.deviceType];
    const failures = results.failures;
    const recommendations = this.generateRecommendations(results, targets);

    const summary = results.passed
      ? `All benchmarks passed for ${results.config.deviceType}`
      : `${failures.length} benchmark(s) failed for ${results.config.deviceType}`;

    return {
      results,
      targets,
      passed: results.passed,
      summary,
      failures,
      recommendations,
    };
  }

  recordResponseTime(responseTimeMs: number): void {
    this.responseTimes.push(responseTimeMs);
  }

  getDurationMs(): number {
    return this.config.durationMs;
  }

  getDeviceType(): DeviceType {
    return this.config.deviceType;
  }

  isBenchmarkRunning(): boolean {
    return this.isRunning;
  }
}
