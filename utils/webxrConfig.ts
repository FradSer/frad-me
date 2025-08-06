// Centralized WebXR configuration system
export type Quality = 'high' | 'medium' | 'low'

// Unified quality configurations to eliminate duplication across components
export const WEBXR_CONFIG = {
  canvas: {
    high: {
      dpr: [1, 2] as [number, number],
      antialias: true,
      shadows: true,
      performance: { min: 0.7 },
    },
    medium: {
      dpr: [1, 1.5] as [number, number],
      antialias: true,
      shadows: false,
      performance: { min: 0.5 },
    },
    low: {
      dpr: 1,
      antialias: false,
      shadows: false,
      performance: { min: 0.3 },
    },
  },

  geometry: {
    segments: {
      high: { sphere: 32, cone: 32, ring: 32, box: 1 },
      medium: { sphere: 24, cone: 16, ring: 24, box: 1 },
      low: { sphere: 16, cone: 8, ring: 16, box: 1 },
    },
  },

  lighting: {
    high: {
      ambient: 0.25,
      directional: 1,
      shadows: true,
      shadowMapSize: 2048,
      particleCount: 20,
      enableVolumetric: true,
    },
    medium: {
      ambient: 0.3,
      directional: 0.8,
      shadows: false,
      shadowMapSize: 1024,
      particleCount: 10,
      enableVolumetric: true,
    },
    low: {
      ambient: 0.4,
      directional: 0.6,
      shadows: false,
      shadowMapSize: 1024,
      particleCount: 0,
      enableVolumetric: false,
    },
  },

  animation: {
    high: {
      rotationIntensity: 0.5,
      floatingRange: [-0.1, 0.1] as [number, number],
      enableDistortion: true,
      particleCount: 60,
    },
    medium: {
      rotationIntensity: 0.5,
      floatingRange: [-0.1, 0.1] as [number, number],
      enableDistortion: true,
      particleCount: 40,
    },
    low: {
      rotationIntensity: 0.2,
      floatingRange: [-0.05, 0.05] as [number, number],
      enableDistortion: false,
      particleCount: 20,
    },
  },

  performance: {
    thresholds: {
      memory: { high: 8, medium: 4, low: 2 },
      cores: { high: 8, medium: 4, low: 2 },
      texture: { high: 4096, medium: 2048, low: 1024 },
      fps: { min: 30, optimal: 60, maxFrameTime: 33.33 },
    },
  },
} as const

// Utility functions to get quality-specific configurations
export const getCanvasConfig = (quality: Quality) =>
  WEBXR_CONFIG.canvas[quality]
export const getGeometryConfig = (quality: Quality) =>
  WEBXR_CONFIG.geometry.segments[quality]
export const getLightingConfig = (quality: Quality) =>
  WEBXR_CONFIG.lighting[quality]
export const getAnimationConfig = (quality: Quality) =>
  WEBXR_CONFIG.animation[quality]
export const getPerformanceConfig = () => WEBXR_CONFIG.performance.thresholds

// Helper for quality-based feature gates
export const supportsFeature = (
  quality: Quality,
  feature: keyof typeof WEBXR_CONFIG.lighting.high,
): boolean => {
  const config = getLightingConfig(quality)
  return config[feature] === true
}
