/**
 * Enhanced WebXR animation hooks using centralized configuration
 * These hooks provide type-safe access to the centralized animation system
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import WEBXR_ANIMATION_CONFIG, {
  getSpringConfig,
  getLerpSpeed,
  type SpringConfigKey,
  type LerpConfigKey,
} from '@/utils/webxr/animationConfig'
import { useSimpleLerp, springConfigToLerpSpeed } from './useSimpleLerp'

// =============================================================================
// ENHANCED ANIMATION HOOKS
// =============================================================================

/**
 * Enhanced spring animation hook using centralized configuration
 */
export const useWebXRSpring = (
  initialValue: number,
  configKey: SpringConfigKey = 'normal'
) => {
  const springConfig = getSpringConfig(configKey)
  return useSimpleLerp(initialValue, { 
    speed: springConfigToLerpSpeed(springConfig) 
  })
}

/**
 * Enhanced lerp animation hook using centralized configuration
 */
export const useWebXRLerp = (
  initialValue: number,
  configKey: LerpConfigKey = 'normal'
) => {
  const lerpSpeed = getLerpSpeed(configKey)
  return useSimpleLerp(initialValue, { speed: lerpSpeed })
}

/**
 * Multi-axis spring animation for positions/scales
 */
export const useWebXRTripleSpring = (
  initialValue: [number, number, number],
  configKey: SpringConfigKey = 'normal'
) => {
  const springConfig = getSpringConfig(configKey)
  const speed = springConfigToLerpSpeed(springConfig)
  
  const currentRef = useRef([...initialValue])
  const targetRef = useRef([...initialValue])

  useFrame((_, delta) => {
    const lerpSpeed = speed * delta * 10
    for (let i = 0; i < 3; i++) {
      currentRef.current[i] = THREE.MathUtils.lerp(
        currentRef.current[i], 
        targetRef.current[i], 
        lerpSpeed
      )
    }
  })

  return {
    get value(): [number, number, number] {
      return currentRef.current as [number, number, number]
    },
    set(target: [number, number, number]) {
      targetRef.current = [...target]
    }
  }
}

/**
 * Breathing animation hook with centralized timing configuration
 */
export const useWebXRBreathing = (
  baseScale: number = 1,
  onBreath?: (scale: number, rotation: number) => void
) => {
  const hasInteracted = useRef(false)
  const { interval, duration, scale: breathingScale } = WEBXR_ANIMATION_CONFIG.timing.breathing
  const { breathingAmplitude, rotationAmplitude } = WEBXR_ANIMATION_CONFIG.spatial.navigation

  const scaleSpring = useWebXRSpring(baseScale, 'bouncy')
  const rotationSpring = useWebXRSpring(0, 'elastic')

  // Breathing animation control
  const startBreathing = () => {
    if (hasInteracted.current) return

    const breathingAnimation = setInterval(() => {
      scaleSpring.set(breathingScale.max)
      rotationSpring.set(rotationAmplitude)
      
      setTimeout(() => {
        scaleSpring.set(baseScale)
        rotationSpring.set(0)
      }, duration)
    }, interval)

    return () => clearInterval(breathingAnimation)
  }

  const stopBreathing = () => {
    hasInteracted.current = true
    scaleSpring.set(baseScale)
    rotationSpring.set(0)
  }

  // Optional callback for external handling
  if (onBreath) {
    useFrame(() => {
      onBreath(scaleSpring.value, rotationSpring.value)
    })
  }

  return {
    scaleValue: scaleSpring.value,
    rotationValue: rotationSpring.value,
    scaleSpring,
    rotationSpring,
    startBreathing,
    stopBreathing,
    hasInteracted: hasInteracted.current,
  }
}

/**
 * Hover animation hook with centralized scale configuration
 */
export const useWebXRHover = (
  baseScale: number = 1,
  configKey: SpringConfigKey = 'bouncy'
) => {
  const hoverScale = WEBXR_ANIMATION_CONFIG.timing.hover.scale
  const scaleSpring = useWebXRSpring(baseScale, configKey)

  const onHover = () => scaleSpring.set(hoverScale)
  const onHoverEnd = () => scaleSpring.set(baseScale)

  return {
    scale: scaleSpring.value,
    onHover,
    onHoverEnd,
  }
}

/**
 * Staggered animation hook for card entrances
 */
export const useWebXRStaggered = (
  index: number,
  configKey: SpringConfigKey = 'elastic'
) => {
  const { cardStagger, cardEntrance } = WEBXR_ANIMATION_CONFIG.timing.transitions
  const delay = index * cardStagger + cardEntrance

  const opacitySpring = useWebXRSpring(0, configKey)
  const scaleSpring = useWebXRSpring(0.8, configKey)
  const positionYSpring = useWebXRSpring(-2, configKey)

  const enter = () => {
    setTimeout(() => {
      opacitySpring.set(1)
      scaleSpring.set(1)
      positionYSpring.set(0)
    }, delay)
  }

  const exit = () => {
    opacitySpring.set(0)
    scaleSpring.set(0.8)
    positionYSpring.set(-2)
  }

  return {
    opacity: opacitySpring.value,
    scale: scaleSpring.value,
    positionY: positionYSpring.value,
    enter,
    exit,
  }
}

/**
 * Hero text animation hook with centralized states
 */
export const useWebXRHeroText = (
  configKey: SpringConfigKey = 'elastic'
) => {
  const { home, hidden } = WEBXR_ANIMATION_CONFIG.spatial.heroText
  const { heroScale, heroActiveScale } = WEBXR_ANIMATION_CONFIG.timing.hover

  const positionSpring = useWebXRTripleSpring(home.position, configKey)
  const scaleSpring = useWebXRTripleSpring(home.scale, configKey)
  const opacitySpring = useWebXRSpring(home.opacity, configKey)
  
  // Interactive scale spring for hover effects
  const interactiveScaleSpring = useWebXRSpring(1, 'bouncy')

  const showHome = () => {
    positionSpring.set(home.position)
    scaleSpring.set(home.scale)
    opacitySpring.set(home.opacity)
  }

  const hide = () => {
    positionSpring.set(hidden.position)
    scaleSpring.set(hidden.scale)
    opacitySpring.set(hidden.opacity)
  }

  const onInteractionStart = () => interactiveScaleSpring.set(heroActiveScale)
  const onHover = () => interactiveScaleSpring.set(heroScale)
  const onInteractionEnd = () => interactiveScaleSpring.set(1)

  return {
    position: positionSpring.value,
    scale: scaleSpring.value,
    opacity: opacitySpring.value,
    interactiveScale: interactiveScaleSpring.value,
    showHome,
    hide,
    onInteractionStart,
    onHover,
    onInteractionEnd,
  }
}

/**
 * Work grid animation hook with centralized configuration
 */
export const useWebXRWorkGrid = (
  view: 'home' | 'work',
  configKey: SpringConfigKey = 'elastic'
) => {
  const opacitySpring = useWebXRSpring(0, configKey)
  const scaleSpring = useWebXRSpring(0.8, configKey)
  const positionYSpring = useWebXRSpring(-2, configKey)

  // React to view changes
  useFrame(() => {
    if (view === 'work') {
      opacitySpring.set(1)
      scaleSpring.set(1)
      positionYSpring.set(0)
    } else {
      opacitySpring.set(0)
      scaleSpring.set(0.8)
      positionYSpring.set(-2)
    }
  })

  const shouldHide = opacitySpring.value < WEBXR_ANIMATION_CONFIG.effects.opacity.visibilityThreshold

  return {
    opacity: opacitySpring.value,
    scale: scaleSpring.value,
    positionY: positionYSpring.value,
    shouldHide,
  }
}

// =============================================================================
// PRESET ANIMATION COMBINATIONS
// =============================================================================

/**
 * Pre-configured animation preset for smooth entrances
 */
export const useSmoothEntrance = (index: number = 0) => {
  const preset = WEBXR_ANIMATION_CONFIG.presets.smoothEntrance
  return useWebXRStaggered(index, preset.spring)
}

/**
 * Pre-configured animation preset for quick transitions
 */
export const useQuickTransition = (initialValue: number) => {
  const preset = WEBXR_ANIMATION_CONFIG.presets.quickTransition
  return useWebXRSpring(initialValue, preset.spring)
}

export default {
  useWebXRSpring,
  useWebXRLerp,
  useWebXRTripleSpring,
  useWebXRBreathing,
  useWebXRHover,
  useWebXRStaggered,
  useWebXRHeroText,
  useWebXRWorkGrid,
  useSmoothEntrance,
  useQuickTransition,
}