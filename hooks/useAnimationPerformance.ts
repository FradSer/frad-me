import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { WEBXR_ANIMATION_CONFIG, updateFPS, getQualityLevel } from '@/utils/webxr/animationConfig';

interface PerformanceMetrics {
  fps: number;
  quality: 'reduced' | 'normal' | 'high';
}

/**
 * Simple performance monitoring hook
 */
export function useAnimationPerformance(warnThreshold = WEBXR_ANIMATION_CONFIG.performance.fpsThreshold) {
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const isMonitoringRef = useRef(false);

  useFrame(() => {
    if (!isMonitoringRef.current) return;

    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    frameTimesRef.current.push(frameTime);
    
    // Keep only last 10 frames
    if (frameTimesRef.current.length > 10) {
      frameTimesRef.current.shift();
    }

    // Calculate and update FPS
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const fps = Math.round(1000 / avgFrameTime);
    updateFPS(fps);

    // Warn on low performance
    if (fps < warnThreshold) {
      console.warn(`WebXR performance: ${fps} FPS (threshold: ${warnThreshold})`);
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

  return {
    get fps() { return frameTimesRef.current.length ? Math.round(1000 / (frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length)) : 60; },
    get quality() { return getQualityLevel(); },
    startMonitoring,
    stopMonitoring,
  };
}