import React, { Suspense, useCallback, useMemo } from 'react'

import { Canvas } from '@react-three/fiber'
import { Html, PerformanceMonitor } from '@react-three/drei'

import Scene3DFallback from './Fallback3D/Scene'
import { webxrErrorLogger } from '@/utils/errorLogger'
import { use3DFallbackState, Quality } from '@/hooks/use3DFallbackState'

interface WebXR3DFallbackProps {
  readonly onError?: (error: Error) => void
}

// Centralized quality configurations with optimized settings
const CANVAS_CONFIGS = {
  high: { 
    dpr: [1, 2] as [number, number], 
    antialias: true, 
    shadows: true,
    performance: { min: 0.7 }
  },
  medium: { 
    dpr: [1, 1.5] as [number, number], 
    antialias: true, 
    shadows: false,
    performance: { min: 0.5 }
  },
  low: { 
    dpr: 1, 
    antialias: false, 
    shadows: false,
    performance: { min: 0.3 }
  }
} as const

const LoadingFallback = React.memo(() => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      <span className="ml-3 text-white">Loading 3D Experience...</span>
    </div>
  </Html>
))
LoadingFallback.displayName = 'LoadingFallback'

// Extracted UI components for better separation of concerns
const QualityIndicator = React.memo<{ quality: Quality }>(({ quality }) => 
  quality !== 'high' ? (
    <div className="absolute bottom-4 right-4 rounded bg-black bg-opacity-50 p-2 text-xs text-white">
      Performance Mode: {quality.toUpperCase()}
    </div>
  ) : null
)
QualityIndicator.displayName = 'QualityIndicator'

const LoadingOverlay = React.memo<{ isLoading: boolean }>(({ isLoading }) =>
  isLoading ? (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-white">Loading 3D experience...</div>
    </div>
  ) : null
)
LoadingOverlay.displayName = 'LoadingOverlay'

const WebXR3DFallback: React.FC<WebXR3DFallbackProps> = ({ onError }) => {
  const {
    quality,
    isLoading,
    error,
    mode,
    updatePerformanceMetrics,
    updateQuality
  } = use3DFallbackState({
    initialQuality: 'high',
    autoAdjustQuality: true,
    debugMode: process.env.NODE_ENV === 'development'
  })

  const canvasConfig = useMemo(() => CANVAS_CONFIGS[quality], [quality])

  // Unified error handler that leverages hook's error state
  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = context ? `${context}: ${error.message}` : error.message
    const enhancedError = new Error(errorMessage)
    
    console.error('[WebXR3DFallback]', enhancedError)
    webxrErrorLogger.logError(enhancedError)
    onError?.(enhancedError)
  }, [onError])

  // Optimized performance monitoring with stable threshold
  const handlePerformanceChange = useCallback((api: { factor: number }) => {
    const fps = Math.max(1, Math.round(60 * api.factor))
    const frameTime = Math.round((1000 / fps) * 100) / 100 // Round to 2 decimal places
    
    updatePerformanceMetrics({
      fps,
      frameTime,
      isStable: api.factor > 0.75 // More stable threshold
    })
  }, [updatePerformanceMetrics])

  // Simplified quality adjustment handlers
  const handleQualityUpgrade = useCallback(() => updateQuality('high'), [updateQuality])
  const handleQualityDowngrade = useCallback(() => {
    updateQuality(quality === 'high' ? 'medium' : 'low')
  }, [quality, updateQuality])

  // Fallback to error message if critical errors or mode is forced to 2D
  if (error?.message.includes('WebGL') || mode === '2d') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-md text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">WebGL Error</h1>
          <p className="mb-6 text-gray-300">
            Your device doesn&apos;t support WebGL or 3D rendering. Please try a different browser or device.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const homeUrl = new URL('/', window.location.origin)
                window.location.href = homeUrl.toString()
              }
            }}
          >
            Go to Main Site
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Canvas
        dpr={canvasConfig.dpr}
        performance={canvasConfig.performance}
        gl={{
          antialias: canvasConfig.antialias,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
          alpha: false,
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false, // Better performance
          premultipliedAlpha: false     // Consistent rendering
        }}
        shadows={canvasConfig.shadows}
        camera={{
          position: [0, 0, 10],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        onError={(error) => handleError(new Error(error.toString()), '3D Canvas Error')}
      >
        <PerformanceMonitor
          onChange={handlePerformanceChange}
          onIncline={handleQualityUpgrade}
          onDecline={handleQualityDowngrade}
        />
        <Suspense fallback={<LoadingFallback />}>
          <Scene3DFallback quality={quality} />
        </Suspense>
      </Canvas>
      
      <QualityIndicator quality={quality} />
      <LoadingOverlay isLoading={isLoading} />
    </div>
  )
}

export default WebXR3DFallback