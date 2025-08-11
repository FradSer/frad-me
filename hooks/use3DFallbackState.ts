import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Chrome-specific API for device memory detection
 */
interface NavigatorDeviceMemory extends Navigator {
  deviceMemory?: number
}

export type Quality = 'high' | 'medium' | 'low'
export type FallbackMode = 'webxr' | '3d' | '2d'

export interface DeviceCapabilities {
  webxr: boolean
  webgl: boolean
  webgl2: boolean
  deviceMemory?: number
  hardwareConcurrency: number
  maxTextureSize?: number
  maxCubeMapTextureSize?: number
}

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage?: number
  drawCalls?: number
  triangles?: number
  isStable: boolean
}

export interface FallbackState {
  mode: FallbackMode
  quality: Quality
  capabilities: DeviceCapabilities
  performanceMetrics: PerformanceMetrics
  isLoading: boolean
  error: Error | null
  canUpgrade: boolean
  canDowngrade: boolean
}

interface Use3DFallbackStateOptions {
  initialQuality?: Quality
  performanceThreshold?: {
    minFps: number
    maxFrameTime: number
  }
  autoAdjustQuality?: boolean
  debugMode?: boolean
}

const DEFAULT_OPTIONS: Required<Use3DFallbackStateOptions> = {
  initialQuality: 'high',
  performanceThreshold: {
    minFps: 30,
    maxFrameTime: 33.33
  },
  autoAdjustQuality: true,
  debugMode: false
}

// Quality level mappings for consistent thresholds
const QUALITY_THRESHOLDS = {
  memory: { high: 8, medium: 4, low: 2 },
  cores: { high: 8, medium: 4, low: 2 },
  texture: { high: 4096, medium: 2048, low: 1024 }
} as const

const QUALITY_ORDER: Quality[] = ['low', 'medium', 'high']

// Optimized utility for safe async operations with better error context
const safeAsync = async <T>(fn: () => Promise<T>, fallback: T, context?: string): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (context && process.env.NODE_ENV === 'development') {
      console.warn(`[safeAsync] Failed in ${context}:`, error)
    }
    return fallback
  }
}

// Simplified capability detection with better error handling
const detectDeviceCapabilities = async (): Promise<DeviceCapabilities> => {
  const baseCapabilities: DeviceCapabilities = {
    webxr: false,
    webgl: false,
    webgl2: false,
    hardwareConcurrency: navigator?.hardwareConcurrency ?? 4
  }

  // Detect WebXR support with context
  if (typeof navigator !== 'undefined' && 'xr' in navigator) {
    baseCapabilities.webxr = await safeAsync(
      () => navigator.xr!.isSessionSupported('immersive-vr'),
      false,
      'WebXR detection'
    )
  }

  // Detect WebGL capabilities
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    
    if (gl) {
      baseCapabilities.webgl = true
      baseCapabilities.webgl2 = !!canvas.getContext('webgl2')
      
      // Get additional WebGL info
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        baseCapabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        baseCapabilities.maxCubeMapTextureSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)
      }
    }
    
    canvas.remove()

    // Get device memory if available (Chrome only)
    if ('deviceMemory' in navigator) {
      baseCapabilities.deviceMemory = (navigator as NavigatorDeviceMemory).deviceMemory
    }
  }

  return baseCapabilities
}

const determineFallbackMode = (capabilities: DeviceCapabilities): FallbackMode => {
  if (capabilities.webxr) return 'webxr'
  if (capabilities.webgl) return '3d'
  return '2d'
}

// Simplified quality determination with unified threshold checking
const determineOptimalQuality = (
  capabilities: DeviceCapabilities,
  requestedQuality: Quality
): Quality => {
  const { memory, cores, texture } = QUALITY_THRESHOLDS
  
  // Check if current quality level is supported by device capabilities
  const isQualitySupported = (quality: Quality): boolean => {
    const memoryOk = !capabilities.deviceMemory || capabilities.deviceMemory >= memory[quality]
    const coresOk = capabilities.hardwareConcurrency >= cores[quality]
    const textureOk = !capabilities.maxTextureSize || capabilities.maxTextureSize >= texture[quality]
    
    return memoryOk && coresOk && textureOk
  }

  // Find the highest supported quality level, starting from requested quality and going down
  const requestedIndex = QUALITY_ORDER.indexOf(requestedQuality)
  
  for (let i = requestedIndex; i >= 0; i--) {
    const quality = QUALITY_ORDER[i]
    if (isQualitySupported(quality)) {
      return quality
    }
  }
  
  return 'low' // Fallback to lowest quality
}

const createDefaultMetrics = (): PerformanceMetrics => ({
  fps: 60,
  frameTime: 16.67,
  memoryUsage: 0,
  drawCalls: 0,
  triangles: 0,
  isStable: true
})

// Unified state initialization logic to eliminate duplication
const initializeState = async (
  config: Required<Use3DFallbackStateOptions>
): Promise<{
  capabilities: DeviceCapabilities
  mode: FallbackMode
  quality: Quality
  metrics: PerformanceMetrics
}> => {
  const capabilities = await detectDeviceCapabilities()
  const mode = determineFallbackMode(capabilities)
  const quality = determineOptimalQuality(capabilities, config.initialQuality)
  const metrics = createDefaultMetrics()
  
  return { capabilities, mode, quality, metrics }
}

// Simplified performance-based quality adjustment
const adjustQualityForPerformance = (
  currentQuality: Quality,
  metrics: PerformanceMetrics,
  threshold: { minFps: number; maxFrameTime: number },
  capabilities: DeviceCapabilities
): Quality => {
  const currentIndex = QUALITY_ORDER.indexOf(currentQuality)
  const isPerformancePoor = metrics.fps < threshold.minFps || metrics.frameTime > threshold.maxFrameTime
  const isPerformanceExcellent = metrics.fps > threshold.minFps * 1.5 && metrics.frameTime < threshold.maxFrameTime * 0.7
  
  if (isPerformancePoor && currentIndex > 0) {
    return QUALITY_ORDER[currentIndex - 1] // Downgrade
  }
  
  if (isPerformanceExcellent && currentIndex < QUALITY_ORDER.length - 1) {
    const nextQuality = QUALITY_ORDER[currentIndex + 1]
    // Only upgrade if device supports the higher quality
    const canUpgradeToNext = nextQuality === 'medium' ? capabilities.webgl : capabilities.webgl2
    return canUpgradeToNext ? nextQuality : currentQuality
  }
  
  return currentQuality
}

// Debug logging utility with better type safety
const debugLog = (debugMode: boolean, message: string, data?: unknown): void => {
  if (debugMode) {
    const logMessage = `[3DFallback] ${message}`
    data !== undefined ? console.log(logMessage, data) : console.log(logMessage)
  }
}

interface Use3DFallbackStateReturn extends FallbackState {
  updateQuality: (quality: Quality) => void
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void
  forceMode: (mode: FallbackMode) => void
  reset: () => void
}

export const use3DFallbackState = (
  options: Use3DFallbackStateOptions = {}
): Use3DFallbackStateReturn => {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options])
  
  // Consolidated state initialization
  const [state, setState] = useState<{
    capabilities: DeviceCapabilities
    performanceMetrics: PerformanceMetrics
    quality: Quality
    mode: FallbackMode
    isLoading: boolean
    error: Error | null
  }>({
    capabilities: {
      webxr: false,
      webgl: false,
      webgl2: false,
      hardwareConcurrency: 4
    },
    performanceMetrics: createDefaultMetrics(),
    quality: config.initialQuality,
    mode: '2d',
    isLoading: true,
    error: null
  })

  // Memoized capability-based upgrade/downgrade flags
  const { canUpgrade, canDowngrade } = useMemo(() => {
    const currentIndex = QUALITY_ORDER.indexOf(state.quality)
    
    return {
      canUpgrade: currentIndex < QUALITY_ORDER.length - 1 && 
                  (state.quality === 'low' ? state.capabilities.webgl : state.capabilities.webgl2),
      canDowngrade: currentIndex > 0
    }
  }, [state.quality, state.capabilities])

  // Optimized update functions with stable references
  const updateQuality = useCallback((newQuality: Quality) => {
    setState(prev => {
      if (prev.quality === newQuality) return prev // Prevent unnecessary updates
      
      debugLog(config.debugMode, `Quality updated: ${prev.quality} -> ${newQuality}`)
      return { ...prev, quality: newQuality }
    })
  }, [config.debugMode])

  const updatePerformanceMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setState(prev => {
      const updatedMetrics = { ...prev.performanceMetrics, ...newMetrics }
      let newQuality = prev.quality
      
      if (config.autoAdjustQuality) {
        newQuality = adjustQualityForPerformance(
          prev.quality,
          updatedMetrics,
          config.performanceThreshold,
          prev.capabilities
        )
        
        if (newQuality !== prev.quality) {
          debugLog(config.debugMode, `Auto-adjusted quality: ${prev.quality} -> ${newQuality} due to performance`)
        }
      }
      
      return {
        ...prev,
        performanceMetrics: updatedMetrics,
        quality: newQuality
      }
    })
  }, [config.autoAdjustQuality, config.performanceThreshold, config.debugMode])

  const forceMode = useCallback((newMode: FallbackMode) => {
    setState(prev => {
      if (prev.mode === newMode) return prev // Prevent unnecessary updates
      
      debugLog(config.debugMode, `Mode forced: ${prev.mode} -> ${newMode}`)
      return { ...prev, mode: newMode }
    })
  }, [config.debugMode])

  // Unified initialization and reset logic
  const initializeOrReset = useCallback(async (isReset = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const { capabilities, mode, quality, metrics } = await initializeState(config)
      
      setState(prev => ({
        ...prev,
        capabilities,
        mode,
        quality,
        performanceMetrics: metrics,
        isLoading: false,
        error: null
      }))
      
      debugLog(config.debugMode, isReset ? 'State reset' : 'Initialized', { capabilities, mode, quality })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to ${isReset ? 'reset' : 'initialize'} capabilities`)
      
      setState(prev => ({
        ...prev,
        error,
        mode: '2d',
        quality: 'low',
        isLoading: false
      }))
      
      debugLog(config.debugMode, `${isReset ? 'Reset' : 'Initialization'} error: ${error.message}`)
    }
  }, [config])

  const reset = useCallback(() => initializeOrReset(true), [initializeOrReset])

  // Optimized initialization effect with mounted check
  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      if (!mounted) return
      
      try {
        await initializeOrReset()
      } catch (error) {
        // Error handling is already done in initializeOrReset
        // This catch prevents unhandled promise rejection warnings
      }
    }
    
    initialize()
    
    return () => {
      mounted = false
    }
  }, [initializeOrReset])

  return {
    mode: state.mode,
    quality: state.quality,
    capabilities: state.capabilities,
    performanceMetrics: state.performanceMetrics,
    isLoading: state.isLoading,
    error: state.error,
    canUpgrade,
    canDowngrade,
    updateQuality,
    updatePerformanceMetrics,
    forceMode,
    reset
  }
}

export default use3DFallbackState