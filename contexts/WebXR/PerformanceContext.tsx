/**
 * Performance Context
 *
 * Provides WebXR performance metrics to components via React Context.
 */

'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import {
  type PerformanceMetrics,
  PerformanceMonitor,
  type QualityLevel,
  type RendererInfo,
} from '@/utils/webxr/performanceMonitor';

export interface PerformanceContextValue {
  fps: number;
  qualityLevel: QualityLevel;
  drawCalls: number;
  memoryUsage: PerformanceMetrics['memoryUsage'];
  metrics: PerformanceMetrics;
  recordFrame: (timestamp: number) => void;
  updateFromRenderer: (rendererInfo: RendererInfo) => void;
  logMetrics: () => void;
  getMonitor: () => PerformanceMonitor;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps): ReactNode {
  const [_updateCounter, setUpdateCounter] = useState(0);
  const monitor = useMemo(() => new PerformanceMonitor(), []);

  const forceUpdate = useCallback(() => {
    setUpdateCounter((prev) => prev + 1);
  }, []);

  const recordFrame = useCallback(
    (timestamp: number) => {
      monitor.recordFrame(timestamp);
      forceUpdate();
    },
    [monitor, forceUpdate],
  );

  const updateFromRenderer = useCallback(
    (rendererInfo: RendererInfo) => {
      monitor.updateFromRenderer(rendererInfo);
      forceUpdate();
    },
    [monitor, forceUpdate],
  );

  const metrics = monitor.getMetrics();

  const value = useMemo<PerformanceContextValue>(
    () => ({
      fps: metrics.fps,
      qualityLevel: metrics.qualityLevel,
      drawCalls: metrics.drawCalls,
      memoryUsage: metrics.memoryUsage,
      metrics,
      recordFrame,
      updateFromRenderer,
      logMetrics: () => monitor.logMetrics(),
      getMonitor: () => monitor,
    }),
    [metrics, monitor, recordFrame, updateFromRenderer],
  );

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
}

export function usePerformance(): PerformanceContextValue {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
