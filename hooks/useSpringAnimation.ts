import { useRef, useCallback } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { SPRING_AXES, FRAME_RATE_LIMIT } from '@/utils/webxr/animationConstants'

interface SpringConfig {
  tension?: number
  friction?: number
  mass?: number
  precision?: number
}

interface UseSpringAnimationReturn {
  value: THREE.Vector3
  set: (target: THREE.Vector3 | [number, number, number]) => void
  velocity: THREE.Vector3
}

export const useSpringAnimation = (
  initialValue: THREE.Vector3 | [number, number, number] = [0, 0, 0],
  config: SpringConfig = {},
): UseSpringAnimationReturn => {
  const { tension = 170, friction = 26, mass = 1, precision = 0.001 } = config

  const value = useRef(
    Array.isArray(initialValue)
      ? new THREE.Vector3(...initialValue)
      : initialValue.clone(),
  )
  const target = useRef(value.current.clone())
  const velocity = useRef(new THREE.Vector3(0, 0, 0))

  const set = useCallback(
    (newTarget: THREE.Vector3 | [number, number, number]) => {
      if (Array.isArray(newTarget)) {
        target.current.set(...newTarget)
      } else {
        target.current.copy(newTarget)
      }
    },
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, FRAME_RATE_LIMIT) // Cap delta to prevent large jumps

    // Spring physics calculation for each axis
    SPRING_AXES.forEach((axis) => {
      const displacement = target.current[axis] - value.current[axis]
      const springForce = displacement * tension
      const dampingForce = velocity.current[axis] * friction
      const force = springForce - dampingForce

      // Apply force (F = ma, so a = F/m)
      const acceleration = force / mass

      // Update velocity and position
      velocity.current[axis] += acceleration * dt
      value.current[axis] += velocity.current[axis] * dt

      // Stop animation when close enough to target
      if (
        Math.abs(displacement) < precision &&
        Math.abs(velocity.current[axis]) < precision
      ) {
        value.current[axis] = target.current[axis]
        velocity.current[axis] = 0
      }
    })
  })

  return {
    value: value.current,
    set,
    velocity: velocity.current,
  }
}

interface UseSpringScalarReturn {
  value: number
  set: (target: number) => void
  velocity: number
}

export const useSpringScalar = (
  initialValue: number = 0,
  config: SpringConfig = {},
): UseSpringScalarReturn => {
  const { tension = 170, friction = 26, mass = 1, precision = 0.001 } = config

  const value = useRef(initialValue)
  const target = useRef(initialValue)
  const velocity = useRef(0)

  const set = useCallback((newTarget: number) => {
    target.current = newTarget
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, FRAME_RATE_LIMIT)

    const displacement = target.current - value.current
    const springForce = displacement * tension
    const dampingForce = velocity.current * friction
    const force = springForce - dampingForce

    const acceleration = force / mass

    velocity.current += acceleration * dt
    value.current += velocity.current * dt

    if (
      Math.abs(displacement) < precision &&
      Math.abs(velocity.current) < precision
    ) {
      value.current = target.current
      velocity.current = 0
    }
  })

  return {
    value: value.current,
    set,
    velocity: velocity.current,
  }
}
