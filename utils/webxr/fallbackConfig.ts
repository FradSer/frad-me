import { Quality } from '@/hooks/use3DFallbackState'

// Fallback system configuration
export type FallbackLevel = 'webxr' | '3d' | '2d'

// Fallback progression rules
export const FALLBACK_PROGRESSION: Record<FallbackLevel, FallbackLevel | null> = {
  webxr: '3d',
  '3d': '2d',
  '2d': null
} as const

// Default retry and threshold settings
export const FALLBACK_DEFAULTS = {
  maxRetries: 2,
  enableAutoFallback: true,
  performanceThreshold: {
    minFps: 30,
    maxFrameTime: 33.33
  }
} as const

// Canvas quality configurations
export const CANVAS_CONFIGS: Record<Quality, {
  dpr: number | [number, number]
  antialias: boolean
  shadows: boolean
  performance: { min: number }
  powerPreference: 'default' | 'high-performance' | 'low-power'
}> = {
  high: { 
    dpr: [1, 2] as [number, number], 
    antialias: true, 
    shadows: true,
    performance: { min: 0.7 },
    powerPreference: 'high-performance'
  },
  medium: { 
    dpr: [1, 1.5] as [number, number], 
    antialias: true, 
    shadows: false,
    performance: { min: 0.5 },
    powerPreference: 'high-performance'
  },
  low: { 
    dpr: 1, 
    antialias: false, 
    shadows: false,
    performance: { min: 0.3 },
    powerPreference: 'low-power'
  }
} as const

// Common WebGL context attributes for consistent rendering
export const WEBGL_CONTEXT_ATTRIBUTES = {
  powerPreference: 'high-performance' as const,
  failIfMajorPerformanceCaveat: false,
  alpha: false,
  stencil: false,
  depth: true,
  preserveDrawingBuffer: false,
  premultipliedAlpha: false
} as const

// Camera configuration for fallback 3D scenes
export const FALLBACK_CAMERA_CONFIG = {
  position: [0, 0, 10] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000
} as const

// Error reasons for user-friendly error messages
export const ERROR_REASONS = [
  'Unsupported device or browser',
  'WebGL/WebXR not available', 
  'Graphics hardware limitations'
] as const

// Test data attributes for component identification
export const TEST_IDS = {
  webxrErrorFallback: 'webxr-error-fallback',
  errorTitle: 'error-title',
  errorTryAgainButton: 'error-try-again-button',
  errorReturnButton: 'error-return-to-main-site-button',
  fallback2D: '2d-fallback',
  fallback3D: '3d-fallback',
  fallback3DCanvas: '3d-fallback-canvas',
  fallback3DLoading: '3d-loading-overlay',
  fallback2DRetry: '2d-retry-button',
  fallback2DHome: '2d-home-button',
  qualityIndicator: 'quality-indicator'
} as const

// Shared CSS classes for consistent styling
export const FALLBACK_STYLES = {
  fullScreenContainer: 'flex h-screen w-screen items-center justify-center',
  errorBackground: 'bg-gray-900 text-white',
  fallback2DBackground: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  fallback3DBackground: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  maxWidthContainer: 'max-w-md text-center',
  maxWidthLarge: 'max-w-4xl px-8 text-center text-white',
  buttonBase: 'rounded-lg px-6 py-3 font-medium text-white transition-colors',
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
  buttonSecondary: 'bg-gray-700 hover:bg-gray-600',
  loadingSpinner: 'h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent',
  qualityIndicator: 'absolute bottom-4 right-4 rounded bg-black bg-opacity-50 p-2 text-xs text-white',
  loadingOverlay: 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'
} as const

// Animation configurations for fallback components
export const FALLBACK_ANIMATIONS = {
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.1 }
    }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  },
  float: {
    y: [-5, 5, -5] as number[],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
} as const

// Decorative shapes configuration for 2D fallback
export const DECORATIVE_SHAPES = [
  { className: "h-16 w-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500", delay: 0 },
  { className: "h-20 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500", delay: 1 },
  { className: "h-14 w-14 rotate-45 bg-gradient-to-br from-pink-400 to-red-500", delay: 2 }
] as const

// Personal content for 2D fallback
export const FALLBACK_CONTENT = {
  name: "Frad LEE",
  descriptions: [
    "is a self-taught craftier",
    "who is eager to learn for advancement.",
    "Whether it is coding in a new language,",
    "design with any tool whatsoever",
    "or building a startup."
  ]
} as const