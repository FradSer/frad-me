import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { WEBXR_ANIMATION_CONFIG } from '@/utils/webxr/animationConfig';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  quality: 'reduced' | 'normal' | 'high';
}

interface PerformanceOptions {
  warnThreshold?: number;
  sampleSize?: number;
}

/**
 * Hook for monitoring WebXR animation performance
 * @param options Performance monitoring options
 * @returns Performance metrics and control functions
 */
export function useAnimationPerformance(options: PerformanceOptions = {}) {
  const {
    warnThreshold = WEBXR_ANIMATION_CONFIG.performance.fpsThreshold,
    sampleSize = WEBXR_ANIMATION_CONFIG.performance.sampleSize
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67, // 1000ms / 60fps
    quality: 'normal'
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const isMonitoringRef = useRef(false);
  const warningShownRef = useRef(false);

  const updateMetrics = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    frameTimesRef.current.push(frameTime);
    
    // Keep only the last sampleSize frames
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    // Calculate average FPS from frame times
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const fps = 1000 / avgFrameTime;

    // Determine quality level
    let quality: 'reduced' | 'normal' | 'high' = 'normal';
    if (fps >= WEBXR_ANIMATION_CONFIG.performance.highQualityThreshold) quality = 'high';
    else if (fps < warnThreshold) quality = 'reduced';

    metricsRef.current = {
      fps: Math.round(fps),
      frameTime: avgFrameTime,
      quality
    };

    // Emit warning on performance degradation
    if (fps < warnThreshold && !warningShownRef.current) {
      console.warn(
        `WebXR animation performance degradation detected: ${Math.round(fps)} FPS (threshold: ${warnThreshold} FPS). ` +
        'Consider reducing animation complexity or enabling adaptive quality.'
      );
      warningShownRef.current = true;
    } else if (fps >= warnThreshold) {
      warningShownRef.current = false;
    }
  }, [warnThreshold, sampleSize]);

  useFrame(() => {
    if (isMonitoringRef.current) {
      updateMetrics();
    }
  });

  const startMonitoring = useCallback(() => {
    isMonitoringRef.current = true;
    frameTimesRef.current = [];
    lastFrameTimeRef.current = performance.now();
  }, []);

  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
  }, []);

  const reportFPS = useCallback((fps: number) => {
    // Allow manual FPS reporting for testing
    metricsRef.current.fps = fps;
    metricsRef.current.frameTime = 1000 / fps;
    metricsRef.current.quality = fps >= WEBXR_ANIMATION_CONFIG.performance.highQualityThreshold ? 'high' : fps >= warnThreshold ? 'normal' : 'reduced';
    
    if (fps < warnThreshold && !warningShownRef.current) {
      console.warn(
        `WebXR animation performance degradation detected: ${fps} FPS (threshold: ${warnThreshold} FPS)`
      );
      warningShownRef.current = true;
    }
  }, [warnThreshold]);

  // Auto-start monitoring on mount
  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    get fps() { return metricsRef.current.fps; },
    get frameTime() { return metricsRef.current.frameTime; },
    get quality() { return metricsRef.current.quality; },
    startMonitoring,
    stopMonitoring,
    reportFPS, // For testing purposes
  };
}