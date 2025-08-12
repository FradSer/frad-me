/**
 * Centralized WebXR Animation Configuration
 * 
 * This file consolidates all animation constants, timing, and spatial configurations
 * used across WebXR components for better maintainability and consistency.
 * 
 * @example
 * // Access spring configuration
 * const springConfig = WEBXR_ANIMATION_CONFIG.physics.springs.bouncy
 * 
 * // Use in component
 * const spring = useSimpleLerp(0, { 
 *   speed: springConfigToLerpSpeed(springConfig) 
 * })
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type SpringConfig = {
  tension: number
  friction: number
}

export type Vector3Tuple = [number, number, number]
export type Vector2Tuple = readonly [number, number]

export type AnimationState = {
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple | number
  opacity?: number
}

export type CameraConfig = {
  position: Vector3Tuple
  lookAt: Vector3Tuple
  fov?: number
}

// Define key types to avoid circular reference issues
export type SpringConfigKey = 'slow' | 'normal' | 'fast' | 'bouncy' | 'elastic'
export type LerpConfigKey = 'slow' | 'normal' | 'fast' | 'instant'
export type AnimationPresetKey = 'smoothEntrance' | 'quickTransition' | 'breathingAnimation'

// =============================================================================
// MAIN CONFIGURATION
// =============================================================================

export const WEBXR_ANIMATION_CONFIG = {
  // Physics-based animation configurations
  physics: {
    springs: {
      slow: { tension: 180, friction: 20 } as SpringConfig,
      normal: { tension: 280, friction: 28 } as SpringConfig,
      fast: { tension: 450, friction: 35 } as SpringConfig,
      bouncy: { tension: 320, friction: 22 } as SpringConfig,
      elastic: { tension: 400, friction: 25 } as SpringConfig,
    },
    lerp: {
      slow: 0.02,
      normal: 0.05,
      fast: 0.1,
      instant: 1,
    },
  },

  // Timing configurations (all in milliseconds where applicable)
  timing: {
    breathing: {
      interval: 2500,        // Navigation breathing animation interval
      duration: 1000,        // Duration of breathing effect
      scale: { min: 1, max: 1.08 }, // Breathing scale range
    },
    transitions: {
      viewChange: 300,       // View transitions (home ↔ work)
      cardEntrance: 400,     // Base delay for card entrance
      cardStagger: 150,      // Stagger delay between cards (was 0.15s)
      sectionFade: 800,      // Section fade transitions
      cardAnimationDuration: 1200, // Total card animation duration
    },
    hover: {
      scale: 1.15,          // Navigation hover scale
      heroScale: 1.1,       // Hero text hover scale
      heroActiveScale: 1.3, // Hero text active scale
    },
  },

  // Spatial configurations (3D positions and transforms)
  spatial: {
    camera: {
      home: { 
        position: [0, 0, 5] as Vector3Tuple, 
        lookAt: [0, 0, 0] as Vector3Tuple,
        fov: 75,
      },
      work: { 
        position: [0, 2, 8] as Vector3Tuple, 
        lookAt: [0, 0, 0] as Vector3Tuple,
        fov: 65,
      },
    },
    navigation: {
      group: [0, 0, -3] as Vector3Tuple,
      buttonOffset: [2.5, 2.8, 2] as Vector3Tuple,
      breathingAmplitude: 0.08, // Scale variation for breathing
      rotationAmplitude: 0.05,  // Rotation variation for breathing
    },
    footer: {
      group: [0, 0, -4] as Vector3Tuple,
      linksOffset: [2.4, -2.5, 2] as Vector3Tuple,
    },
    workGrid: {
      title: [0, 5, 0] as Vector3Tuple,
      basePosition: [-6, 0.5, -8] as Vector3Tuple,
      spacing: { x: 6, y: 5 },
      cardsPerRow: 3,
      directionalLight: [5, 5, 5] as Vector3Tuple,
      pointLight: [-5, 3, 2] as Vector3Tuple,
    },
    workCard: {
      geometry: [4.5, 3, 1] as Vector3Tuple,
      titleOffset: -2,
      badgeOffset: [2, 1.2] as Vector2Tuple,
      layerSpacing: 0.1,
      entrancePosition: [0, -15, -5] as Vector3Tuple,
      displayPosition: [0, 0, 0] as Vector3Tuple,
      hoverPosition: [0, 1, 2] as Vector3Tuple,
    },
    heroText: {
      home: { 
        position: [0, 1, -10] as Vector3Tuple, 
        scale: [1, 1, 1] as Vector3Tuple, 
        opacity: 1,
      },
      hidden: { 
        position: [0, -5, -40] as Vector3Tuple, 
        scale: [0.6, 0.6, 0.6] as Vector3Tuple, 
        opacity: 0,
      },
    },
    immersiveButton: {
      button: [0, -2, -3] as Vector3Tuple,
      textGroup: [0, 0, 0.001] as Vector3Tuple,
    },
    entrance: {
      workDefault: [0, 0, -8] as Vector3Tuple,
      heroDefault: [0, 0, -5] as Vector3Tuple,
    },
  },

  // Visual effects and material configurations
  effects: {
    hover: {
      scale: 1.15,
      colorTransition: '#9ca3af → #d1d5db',
    },
    opacity: {
      visibilityThreshold: 0.01, // Hide components below this opacity
      fadeSpeed: 0.03,
    },
    lighting: {
      ambient: 0.4,
      directional: 0.8,
      point: 0.6,
      pointLightIntensity: 0.3,
    },
    materials: {
      platform: { transparent: true, opacity: 0.3 },
      cardOpacity: 0.2,
    },
  },

  // Performance and optimization settings
  performance: {
    deltaClamp: 1/30,         // Max delta time for physics stability
    updateThrottles: {
      mouse: 16,              // 60fps
      resize: 100,
    },
    qualityLevels: {
      high: { shadowMapSize: 2048, antialias: true },
      medium: { shadowMapSize: 1024, antialias: true },
      low: { shadowMapSize: 512, antialias: false },
    },
  },

  // Animation presets for common use cases
  presets: {
    smoothEntrance: {
      spring: 'elastic' as SpringConfigKey,
      delay: 500,
      stagger: 150,
    },
    quickTransition: {
      spring: 'fast' as SpringConfigKey,
      delay: 0,
      stagger: 50,
    },
    breathingAnimation: {
      spring: 'bouncy' as SpringConfigKey,
      interval: 2500,
      duration: 1000,
    },
  },
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type WebXRAnimationConfig = typeof WEBXR_ANIMATION_CONFIG

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a spring configuration by key
 */
export const getSpringConfig = (key: SpringConfigKey): SpringConfig => {
  return WEBXR_ANIMATION_CONFIG.physics.springs[key]
}

/**
 * Get a lerp speed configuration by key
 */
export const getLerpSpeed = (key: LerpConfigKey): number => {
  return WEBXR_ANIMATION_CONFIG.physics.lerp[key]
}

/**
 * Calculate staggered delay for animations
 */
export const getStaggerDelay = (
  index: number, 
  baseDelay: number = WEBXR_ANIMATION_CONFIG.timing.transitions.cardStagger
): number => {
  return index * baseDelay
}

/**
 * Check if component should be hidden based on opacity threshold
 */
export const shouldHideComponent = (opacity: number): boolean => {
  return opacity < WEBXR_ANIMATION_CONFIG.effects.opacity.visibilityThreshold
}

/**
 * Get computed navigation button absolute position
 */
export const getNavigationButtonPosition = (): Vector3Tuple => {
  const { group, buttonOffset } = WEBXR_ANIMATION_CONFIG.spatial.navigation
  return [
    group[0] + buttonOffset[0],
    group[1] + buttonOffset[1], 
    group[2] + buttonOffset[2]
  ] as Vector3Tuple
}

/**
 * Get work card positions with computed values
 */
export const getWorkCardPositions = () => {
  const { geometry, titleOffset, badgeOffset, layerSpacing } = WEBXR_ANIMATION_CONFIG.spatial.workCard
  
  return {
    cardGeometry: geometry,
    titleGroup: [0, titleOffset, layerSpacing] as Vector3Tuple,
    descriptionGroup: [0, titleOffset - 0.8, layerSpacing] as Vector3Tuple,
    wipBadgeGroup: [badgeOffset[0], badgeOffset[1], layerSpacing] as Vector3Tuple,
    wipBadgeBackground: [0, 0, -layerSpacing] as Vector3Tuple,
  }
}

/**
 * Development-only configuration inspector and validation
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make config available for debugging
  (window as any).__WEBXR_CONFIG__ = WEBXR_ANIMATION_CONFIG
  
  // Validate configuration on load
  import('./configValidator').then(({ validateAnimationConfig }) => {
    const isValid = validateAnimationConfig(WEBXR_ANIMATION_CONFIG)
    if (isValid) {
      console.log('✅ WebXR Animation Configuration validated successfully')
    } else {
      console.warn('⚠️ WebXR Animation Configuration has validation issues (see above)')
    }
  })
}

export default WEBXR_ANIMATION_CONFIG