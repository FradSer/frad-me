/**
 * Configuration validation utilities for WebXR animation config
 * Ensures type safety and runtime validation of animation configurations
 */

import type { SpringConfig, Vector3Tuple, Vector2Tuple } from './animationConfig'

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export class ConfigValidator {
  /**
   * Validates a spring configuration object
   */
  static validateSpringConfig(config: unknown): config is SpringConfig {
    return (
      typeof config === 'object' &&
      config !== null &&
      'tension' in config &&
      'friction' in config &&
      typeof (config as any).tension === 'number' &&
      typeof (config as any).friction === 'number' &&
      (config as any).tension > 0 &&
      (config as any).friction > 0
    )
  }

  /**
   * Validates a 3D vector tuple
   */
  static validateVector3(value: unknown): value is Vector3Tuple {
    return (
      Array.isArray(value) &&
      value.length === 3 &&
      value.every(v => typeof v === 'number' && !isNaN(v))
    )
  }

  /**
   * Validates a 2D vector tuple
   */
  static validateVector2(value: unknown): value is Vector2Tuple {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      value.every(v => typeof v === 'number' && !isNaN(v))
    )
  }

  /**
   * Validates timing configuration
   */
  static validateTiming(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      value >= 0
    )
  }

  /**
   * Validates opacity value
   */
  static validateOpacity(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      value >= 0 &&
      value <= 1
    )
  }

  /**
   * Validates scale value (can be number or Vector3Tuple)
   */
  static validateScale(value: unknown): value is number | Vector3Tuple {
    if (typeof value === 'number') {
      return !isNaN(value) && value > 0
    }
    return this.validateVector3(value)
  }

  /**
   * Validates lerp speed value
   */
  static validateLerpSpeed(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      value >= 0 &&
      value <= 1
    )
  }
}

// =============================================================================
// RUNTIME VALIDATION
// =============================================================================

/**
 * Validates the entire animation configuration at runtime
 * Only runs in development mode for performance
 */
export const validateAnimationConfig = (config: any): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    return true
  }

  const warnings: string[] = []

  try {
    // Validate physics.springs
    if (config.physics?.springs) {
      Object.entries(config.physics.springs).forEach(([key, springConfig]) => {
        if (!ConfigValidator.validateSpringConfig(springConfig)) {
          warnings.push(`Invalid spring config for "${key}": ${JSON.stringify(springConfig)}`)
        }
      })
    }

    // Validate physics.lerp
    if (config.physics?.lerp) {
      Object.entries(config.physics.lerp).forEach(([key, lerpSpeed]) => {
        if (!ConfigValidator.validateLerpSpeed(lerpSpeed)) {
          warnings.push(`Invalid lerp speed for "${key}": ${lerpSpeed}`)
        }
      })
    }

    // Validate timing values
    if (config.timing) {
      const validateTimingSection = (section: any, sectionName: string) => {
        Object.entries(section).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            validateTimingSection(value, `${sectionName}.${key}`)
          } else if (!ConfigValidator.validateTiming(value)) {
            warnings.push(`Invalid timing value for "${sectionName}.${key}": ${value}`)
          }
        })
      }
      validateTimingSection(config.timing, 'timing')
    }

    // Validate spatial configurations
    if (config.spatial) {
      const validateSpatialSection = (section: any, sectionName: string) => {
        Object.entries(section).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length === 3 && !ConfigValidator.validateVector3(value)) {
              warnings.push(`Invalid Vector3 for "${sectionName}.${key}": ${JSON.stringify(value)}`)
            } else if (value.length === 2 && !ConfigValidator.validateVector2(value)) {
              warnings.push(`Invalid Vector2 for "${sectionName}.${key}": ${JSON.stringify(value)}`)
            }
          } else if (typeof value === 'object' && value !== null) {
            validateSpatialSection(value, `${sectionName}.${key}`)
          }
        })
      }
      validateSpatialSection(config.spatial, 'spatial')
    }

    // Validate opacity values
    if (config.effects?.opacity) {
      Object.entries(config.effects.opacity).forEach(([key, value]) => {
        if (key.includes('opacity') || key.includes('threshold')) {
          if (!ConfigValidator.validateOpacity(value)) {
            warnings.push(`Invalid opacity value for "${key}": ${value}`)
          }
        }
      })
    }

    // Log warnings in development
    if (warnings.length > 0) {
      console.warn('WebXR Animation Configuration Validation Warnings:', warnings)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating animation configuration:', error)
    return false
  }
}

// =============================================================================
// PERFORMANCE VALIDATION
// =============================================================================

/**
 * Performance-focused validation for critical animation paths
 */
export const validatePerformanceCriticalConfig = (
  springConfig: SpringConfig,
  context: string
): boolean => {
  const { tension, friction } = springConfig

  // Warn about potentially expensive spring configurations
  if (tension > 500) {
    console.warn(`High tension value (${tension}) in ${context} may cause performance issues`)
  }

  if (friction < 10) {
    console.warn(`Low friction value (${friction}) in ${context} may cause excessive oscillation`)
  }

  // Check for unstable configurations
  const dampingRatio = friction / (2 * Math.sqrt(tension))
  if (dampingRatio < 0.1) {
    console.warn(`Potentially unstable spring configuration in ${context} (damping ratio: ${dampingRatio.toFixed(3)})`)
  }

  return true
}

export default ConfigValidator