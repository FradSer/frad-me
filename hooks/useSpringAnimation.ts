import { useRef, useMemo } from 'react'

interface SpringConfig {
  tension: number
  friction: number
}

interface SpringValue {
  value: number
  velocity: number
  target: number
}

export class SpringScalar {
  private currentValue: number = 0
  private currentVelocity: number = 0
  private targetValue: number = 0
  private config: SpringConfig

  constructor(initialValue: number, config: SpringConfig) {
    this.currentValue = initialValue
    this.targetValue = initialValue
    this.config = config
  }

  set(target: number) {
    this.targetValue = target
  }

  get value(): number {
    return this.currentValue
  }

  update(deltaTime: number = 1/60) {
    // Clamp deltaTime to prevent physics instability with irregular frame rates
    const clampedDelta = Math.min(deltaTime, 1/30) // Max 30fps, min stable timestep
    
    if (Math.abs(this.currentValue - this.targetValue) < 0.001 && 
        Math.abs(this.currentVelocity) < 0.001) {
      this.currentValue = this.targetValue
      this.currentVelocity = 0
      return this.currentValue
    }

    const force = -this.config.tension * (this.currentValue - this.targetValue)
    const damping = -this.config.friction * this.currentVelocity
    const acceleration = force + damping

    this.currentVelocity += acceleration * clampedDelta
    this.currentValue += this.currentVelocity * clampedDelta

    return this.currentValue
  }
}

export const useSpringScalar = (initialValue: number, config: SpringConfig) => {
  return useMemo(() => new SpringScalar(initialValue, config), [initialValue, config.tension, config.friction])
}

export const useSpringAnimation = (
  from: [number, number, number], 
  config: SpringConfig
) => {
  const springs = useMemo(() => [
    new SpringScalar(from[0], config),
    new SpringScalar(from[1], config),
    new SpringScalar(from[2], config),
  ], [from, config])

  return {
    set: (to: [number, number, number]) => {
      springs[0].set(to[0])
      springs[1].set(to[1])
      springs[2].set(to[2])
    },
    get value(): [number, number, number] {
      return [springs[0].value, springs[1].value, springs[2].value]
    }
  }
}