/**
 * Performance Monitor
 *
 * Tracks WebXR performance metrics including FPS, draw calls, and memory usage.
 * Provides quality level adaptation based on current performance.
 */

export enum QualityLevel {
  High = 60,
  Normal = 45,
  Reduced = 30,
}

export interface RendererMemoryInfo {
  geometries: number;
  textures: number;
  programs: number;
}

export interface RendererRenderInfo {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
}

export interface RendererInfo {
  memory: RendererMemoryInfo;
  render: RendererRenderInfo;
}

export interface MemoryUsage {
  geometries: number;
  textures: number;
  programs: number;
}

export interface PerformanceMetrics {
  fps: number;
  qualityLevel: QualityLevel;
  drawCalls: number;
  memoryUsage: MemoryUsage;
}

const FRAME_HISTORY_SIZE = 60;

export class PerformanceMonitor {
  private frameTimestamps: number[] = [];
  private currentFps = 0;
  private currentQualityLevel = QualityLevel.High;
  private currentDrawCalls = 0;
  private currentMemoryUsage: MemoryUsage = {
    geometries: 0,
    textures: 0,
    programs: 0,
  };

  /**
   * Record a frame timestamp for FPS calculation
   */
  recordFrame(timestamp: number): void {
    this.frameTimestamps.push(timestamp);

    // Keep only recent frames
    if (this.frameTimestamps.length > FRAME_HISTORY_SIZE) {
      this.frameTimestamps.shift();
    }

    // Always update FPS when we have enough data
    this.updateFps(timestamp);
  }

  /**
   * Calculate FPS based on frame intervals
   */
  private updateFps(timestamp: number): void {
    if (this.frameTimestamps.length < 2) {
      this.currentFps = 0;
      return;
    }

    // Calculate average frame time over the last second
    const oneSecondAgo = timestamp - 1000;
    const recentFrames = this.frameTimestamps.filter((t) => t >= oneSecondAgo);

    if (recentFrames.length < 2) {
      this.currentFps = 0;
      return;
    }

    const frameCount = recentFrames.length - 1;
    const totalTime = recentFrames[frameCount] - recentFrames[0];
    this.currentFps = totalTime > 0 ? (frameCount / totalTime) * 1000 : 0;
    this.updateQualityLevel();
  }

  /**
   * Update quality level based on current FPS
   */
  private updateQualityLevel(): void {
    if (this.currentFps >= QualityLevel.High) {
      this.currentQualityLevel = QualityLevel.High;
    } else if (this.currentFps >= QualityLevel.Reduced) {
      this.currentQualityLevel = QualityLevel.Normal;
    } else {
      this.currentQualityLevel = QualityLevel.Reduced;
    }
  }

  /**
   * Update metrics from renderer info
   */
  updateFromRenderer(rendererInfo: RendererInfo): void {
    this.currentDrawCalls = rendererInfo.render.calls;
    this.currentMemoryUsage = {
      geometries: rendererInfo.memory.geometries,
      textures: rendererInfo.memory.textures,
      programs: rendererInfo.memory.programs,
    };
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      fps: this.currentFps,
      qualityLevel: this.currentQualityLevel,
      drawCalls: this.currentDrawCalls,
      memoryUsage: { ...this.currentMemoryUsage },
    };
  }

  /**
   * Log current metrics in development mode
   */
  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      const metrics = this.getMetrics();
      console.log(
        `[PerformanceMonitor] fps:${metrics.fps.toFixed(2)} qualityLevel:${QualityLevel[metrics.qualityLevel]} drawCalls:${metrics.drawCalls} memoryUsage:${JSON.stringify(metrics.memoryUsage)}`,
      );
    }
  }
}
