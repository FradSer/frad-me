import { useRef, useCallback, useMemo } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type AnimationType =
  | 'float'
  | 'rotate'
  | 'scale'
  | 'orbit'
  | 'pulse'
  | 'bounce'
  | 'sway'
export type EasingFunction = (t: number) => number
export type Axis = 'x' | 'y' | 'z'

interface BaseAnimationConfig {
  speed?: number
  intensity?: number
  delay?: number
  direction?: 'forward' | 'reverse' | 'alternate'
  easing?: EasingFunction
  enabled?: boolean
}

export interface AnimationConfig extends BaseAnimationConfig {
  // Float-specific
  amplitude?: number
  frequency?: number
  // Rotation-specific
  axis?: Axis | 'all'
  // Scale/Pulse-specific
  min?: number
  max?: number
  // Orbit-specific
  radius?: number
  centerOffset?: [number, number, number]
  // Pulse-specific
  property?: 'opacity' | 'emissiveIntensity' | 'both'
}

// Legacy type aliases for backward compatibility
export type FloatAnimationConfig = AnimationConfig
export type RotationAnimationConfig = AnimationConfig
export type ScaleAnimationConfig = AnimationConfig
export type OrbitAnimationConfig = AnimationConfig
export type PulseAnimationConfig = AnimationConfig

export const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  elastic: (t: number) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
  bounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
  sine: (t: number) => Math.sin((t * Math.PI) / 2),
} as const

// Default configurations for each animation type
const DEFAULT_CONFIGS: Record<AnimationType, Partial<AnimationConfig>> = {
  float: {
    speed: 1,
    intensity: 1,
    amplitude: 0.5,
    frequency: 1,
    easing: easingFunctions.sine,
  },
  rotate: { speed: 1, intensity: 1, axis: 'y', easing: easingFunctions.linear },
  scale: {
    speed: 2,
    intensity: 1,
    min: 0.9,
    max: 1.1,
    easing: easingFunctions.easeInOut,
  },
  orbit: {
    speed: 0.5,
    intensity: 1,
    radius: 2,
    centerOffset: [0, 0, 0],
    axis: 'y',
    easing: easingFunctions.linear,
  },
  pulse: {
    speed: 2,
    intensity: 1,
    property: 'both',
    min: 0.3,
    max: 1.0,
    easing: easingFunctions.sine,
  },
  bounce: { speed: 1, intensity: 1, easing: easingFunctions.bounce },
  sway: { speed: 1, intensity: 1, easing: easingFunctions.sine },
} as const

// Animation state calculation helpers
const calculateAnimationState = (time: number, config: AnimationConfig) => {
  const {
    speed = 1,
    delay = 0,
    direction = 'forward',
    easing = easingFunctions.linear,
  } = config
  const adjustedTime = (time + delay) * speed
  const directionMultiplier = direction === 'reverse' ? -1 : 1
  const easedTime = easing(Math.abs(Math.sin(adjustedTime)) % 1)

  return { adjustedTime, directionMultiplier, easedTime }
}

// Position update helpers
const updatePositionOnAxis = (
  position: THREE.Vector3,
  initialPos: THREE.Vector3 | undefined,
  axis: 'x' | 'y' | 'z',
  value: number,
) => {
  if (initialPos) {
    position[axis] = initialPos[axis] + value
  } else {
    position[axis] += value * 0.01
  }
}

const updateMaterialProperty = (
  object: THREE.Object3D,
  property: 'opacity' | 'emissiveIntensity',
  value: number,
) => {
  if (!('material' in object)) return

  const material = object.material as THREE.Material & {
    [key: string]: unknown
  }
  if (property in material) {
    material[property] = value
  }
}

// Individual animation functions
const animationFunctions = {
  float: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
    initialPosition?: THREE.Vector3,
  ) => {
    const { amplitude = 1, frequency = 1, intensity = 1 } = config
    const { adjustedTime, directionMultiplier } = state
    const offset =
      Math.sin(adjustedTime * frequency) *
      amplitude *
      intensity *
      directionMultiplier

    if (ref.current) {
      updatePositionOnAxis(ref.current.position, initialPosition, 'y', offset)
    }
  },

  rotate: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
  ) => {
    const { axis = 'y', intensity = 1 } = config
    const { adjustedTime, directionMultiplier } = state
    const rotation = adjustedTime * intensity * directionMultiplier

    if (!ref.current) return

    if (axis === 'all') {
      ref.current.rotation.set(rotation, rotation, rotation)
    } else {
      ref.current.rotation[axis as Axis] = rotation
    }
  },

  scale: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
  ) => {
    const { min = 0.8, max = 1.2, intensity = 1 } = config
    const { easedTime } = state
    const scale = min + (max - min) * (easedTime * intensity)

    ref.current?.scale.setScalar(scale)
  },

  orbit: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
    initialPosition?: THREE.Vector3,
  ) => {
    const {
      radius = 2,
      centerOffset = [0, 0, 0],
      axis = 'y',
      intensity = 1,
    } = config
    const { adjustedTime, directionMultiplier } = state
    const angle = adjustedTime * directionMultiplier

    if (!ref.current || !initialPosition) return

    const [cx, cy, cz] = centerOffset
    const cosAngle = Math.cos(angle) * radius * intensity
    const sinAngle = Math.sin(angle) * radius * intensity

    const axisMap = {
      y: {
        x: initialPosition.x + cx + cosAngle,
        z: initialPosition.z + cz + sinAngle,
      },
      x: {
        y: initialPosition.y + cy + cosAngle,
        z: initialPosition.z + cz + sinAngle,
      },
      z: {
        x: initialPosition.x + cx + cosAngle,
        y: initialPosition.y + cy + sinAngle,
      },
    }[axis as Axis]

    Object.assign(ref.current.position, axisMap)
  },

  pulse: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
  ) => {
    const { property = 'both', min = 0.2, max = 1.0, intensity = 1 } = config
    const { easedTime } = state
    const pulseValue = min + (max - min) * easedTime * intensity

    if (!ref.current) return

    if (property === 'opacity' || property === 'both') {
      updateMaterialProperty(ref.current, 'opacity', pulseValue)
    }

    if (property === 'emissiveIntensity' || property === 'both') {
      updateMaterialProperty(ref.current, 'emissiveIntensity', pulseValue)
    }
  },

  bounce: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
    initialPosition?: THREE.Vector3,
  ) => {
    const { intensity = 1 } = config
    const { adjustedTime, directionMultiplier } = state
    const bounceValue =
      Math.abs(Math.sin(adjustedTime * 4)) * intensity * directionMultiplier

    if (ref.current) {
      updatePositionOnAxis(
        ref.current.position,
        initialPosition,
        'y',
        bounceValue,
      )
    }
  },

  sway: (
    ref: React.RefObject<THREE.Object3D>,
    state: ReturnType<typeof calculateAnimationState>,
    config: AnimationConfig,
    initialPosition?: THREE.Vector3,
  ) => {
    const { intensity = 1 } = config
    const { adjustedTime, directionMultiplier } = state
    const swayX = Math.sin(adjustedTime) * intensity * 0.1 * directionMultiplier
    const swayZ =
      Math.cos(adjustedTime * 0.7) * intensity * 0.1 * directionMultiplier

    if (ref.current && initialPosition) {
      ref.current.position.x = initialPosition.x + swayX
      ref.current.position.z = initialPosition.z + swayZ
    }
  },
} as const

const applyAnimation = (
  ref: React.RefObject<THREE.Object3D>,
  time: number,
  type: AnimationType,
  config: AnimationConfig,
  initialPosition?: THREE.Vector3,
) => {
  if (!ref.current || !config.enabled) return

  const state = calculateAnimationState(time, config)
  animationFunctions[type](ref, state, config, initialPosition)
}

// Centralized hook factory to eliminate duplication
const createAnimationHook = <T extends AnimationConfig>(
  type: AnimationType,
  needsInitialPosition = false,
) => {
  return (config: T = {} as T) => {
    const ref = useRef<THREE.Object3D>(null)
    const initialPosition = useRef<THREE.Vector3>()
    const hasInitialized = useRef(false)

    // Pre-allocate Vector3 for performance
    const tempVector = useMemo(() => new THREE.Vector3(), [])

    const finalConfig = useMemo(
      () => ({
        enabled: true,
        ...DEFAULT_CONFIGS[type],
        ...config,
      }),
      [config],
    )

    useFrame((state) => {
      if (needsInitialPosition && !hasInitialized.current && ref.current) {
        initialPosition.current = tempVector.copy(ref.current.position)
        hasInitialized.current = true
      }
      applyAnimation(
        ref,
        state.clock.elapsedTime,
        type,
        finalConfig,
        needsInitialPosition ? initialPosition.current : undefined,
      )
    })

    return ref
  }
}

// Create all animation hooks using the factory
export const useFloatAnimation = createAnimationHook<FloatAnimationConfig>(
  'float',
  true,
)
export const useRotationAnimation =
  createAnimationHook<RotationAnimationConfig>('rotate', false)
export const useScaleAnimation = createAnimationHook<ScaleAnimationConfig>(
  'scale',
  false,
)
export const useOrbitAnimation = createAnimationHook<OrbitAnimationConfig>(
  'orbit',
  true,
)
export const usePulseAnimation = createAnimationHook<PulseAnimationConfig>(
  'pulse',
  false,
)
export const useBounceAnimation = createAnimationHook<AnimationConfig>(
  'bounce',
  true,
)
export const useSwayAnimation = createAnimationHook<AnimationConfig>(
  'sway',
  true,
)

export const useCombinedAnimation = (
  animations: Array<{ type: AnimationType; config: AnimationConfig }>,
) => {
  const ref = useRef<THREE.Object3D>(null)
  const initialPosition = useRef<THREE.Vector3>()
  const hasInitialized = useRef(false)

  // Pre-allocate Vector3 for performance
  const tempVector = useMemo(() => new THREE.Vector3(), [])

  const finalAnimations = useMemo(
    () =>
      animations.map(({ type, config }) => ({
        type,
        config: { enabled: true, ...DEFAULT_CONFIGS[type], ...config },
      })),
    [animations],
  )

  const needsInitialPosition = useMemo(
    () =>
      animations.some(({ type }) =>
        ['float', 'orbit', 'bounce', 'sway'].includes(type),
      ),
    [animations],
  )

  useFrame((state) => {
    if (needsInitialPosition && !hasInitialized.current && ref.current) {
      initialPosition.current = tempVector.copy(ref.current.position)
      hasInitialized.current = true
    }

    finalAnimations.forEach(({ type, config }) => {
      applyAnimation(
        ref,
        state.clock.elapsedTime,
        type,
        config,
        needsInitialPosition ? initialPosition.current : undefined,
      )
    })
  })

  return ref
}

export const useSpringAnimation = (
  target: THREE.Vector3 | number,
  config: { stiffness?: number; damping?: number; mass?: number } = {},
) => {
  const { stiffness = 100, damping = 10, mass = 1 } = config
  const ref = useRef<THREE.Object3D>(null)
  const velocity = useRef(typeof target === 'number' ? 0 : new THREE.Vector3())
  const position = useRef(typeof target === 'number' ? 0 : new THREE.Vector3())

  // Pre-allocate vectors to avoid cloning in the animation loop
  const tempVectors = useMemo(
    () => ({
      force: new THREE.Vector3(),
      dampingForce: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      velocityDelta: new THREE.Vector3(),
    }),
    [],
  )

  const updateSpring = useCallback(
    (deltaTime: number) => {
      if (!ref.current) return

      if (typeof target === 'number') {
        const force = stiffness * (target - (position.current as number))
        const dampingForce = damping * (velocity.current as number)
        const acceleration = (force - dampingForce) / mass

        ;(velocity.current as number) += acceleration * deltaTime
        ;(position.current as number) +=
          (velocity.current as number) * deltaTime

        ref.current.scale.setScalar(position.current as number)
      } else {
        const pos = position.current as THREE.Vector3
        const vel = velocity.current as THREE.Vector3

        // Use pre-allocated temporary vectors
        tempVectors.force.copy(target).sub(pos).multiplyScalar(stiffness)
        tempVectors.dampingForce.copy(vel).multiplyScalar(damping)
        tempVectors.acceleration
          .copy(tempVectors.force)
          .sub(tempVectors.dampingForce)
          .divideScalar(mass)

        tempVectors.velocityDelta
          .copy(tempVectors.acceleration)
          .multiplyScalar(deltaTime)
        vel.add(tempVectors.velocityDelta)

        tempVectors.velocityDelta.copy(vel).multiplyScalar(deltaTime)
        pos.add(tempVectors.velocityDelta)

        ref.current.position.copy(pos)
      }
    },
    [target, stiffness, damping, mass, tempVectors],
  )

  useFrame((_, deltaTime) => {
    updateSpring(deltaTime)
  })

  return ref
}

export const AnimationHelpers = {
  useFloatAnimation,
  useRotationAnimation,
  useScaleAnimation,
  useOrbitAnimation,
  usePulseAnimation,
  useBounceAnimation,
  useSwayAnimation,
  useCombinedAnimation,
  useSpringAnimation,
  easingFunctions,
} as const

export default AnimationHelpers
