import { useRef, useMemo } from 'react';
import type { Position } from '@/types/common';

// Improved spring configuration interface
export interface SpringConfig {
  tension: number;
  friction: number;
  precision?: number; // Threshold for considering spring "at rest"
}

// Common spring presets
export const SPRING_PRESETS = {
  gentle: { tension: 120, friction: 14, precision: 0.01 },
  bouncy: { tension: 180, friction: 12, precision: 0.01 },
  quick: { tension: 300, friction: 30, precision: 0.001 },
  slow: { tension: 80, friction: 16, precision: 0.01 },
} as const;

/**
 * Improved SpringScalar with better performance and stability
 * Replaces deprecated SpringScalar class
 */
export class SpringScalar {
  private currentValue: number;
  private currentVelocity: number = 0;
  private targetValue: number;
  private readonly config: Required<SpringConfig>;

  constructor(initialValue: number, config: SpringConfig) {
    this.currentValue = initialValue;
    this.targetValue = initialValue;
    this.config = { precision: 0.001, ...config };
  }

  set(target: number): void {
    this.targetValue = target;
  }

  get value(): number {
    return this.currentValue;
  }

  get isAtRest(): boolean {
    return Math.abs(this.currentValue - this.targetValue) < this.config.precision &&
           Math.abs(this.currentVelocity) < this.config.precision;
  }

  update(deltaTime = 1 / 60): number {
    // Early return if already at rest
    if (this.isAtRest) {
      this.currentValue = this.targetValue;
      this.currentVelocity = 0;
      return this.currentValue;
    }

    // Clamp deltaTime for stability
    const clampedDelta = Math.min(deltaTime, 1 / 30);
    
    const force = -this.config.tension * (this.currentValue - this.targetValue);
    const damping = -this.config.friction * this.currentVelocity;
    const acceleration = force + damping;

    this.currentVelocity += acceleration * clampedDelta;
    this.currentValue += this.currentVelocity * clampedDelta;

    return this.currentValue;
  }
}

/**
 * Hook for managing a single spring value
 * Replaces deprecated useSpringScalar
 */
export const useSpringValue = (
  initialValue: number,
  config: SpringConfig = SPRING_PRESETS.bouncy
) => {
  return useMemo(
    () => new SpringScalar(initialValue, config),
    [initialValue, config.tension, config.friction, config.precision]
  );
};

/**
 * Hook for managing 3D position springs
 * Replaces deprecated useSpringAnimation
 */
export const useTripleSpring = (
  initialValues: [number, number, number],
  config: SpringConfig = SPRING_PRESETS.bouncy
) => {
  const springs = useMemo(
    () => initialValues.map(value => new SpringScalar(value, config)),
    [initialValues, config]
  );

  return {
    set: (targets: [number, number, number]) => {
      springs.forEach((spring, index) => spring.set(targets[index]));
    },
    get values(): [number, number, number] {
      return springs.map(spring => spring.value) as [number, number, number];
    },
    get isAtRest(): boolean {
      return springs.every(spring => spring.isAtRest);
    },
    update: (deltaTime?: number) => {
      springs.forEach(spring => spring.update(deltaTime));
    }
  };
};

/**
 * Hook for managing 2D position springs
 */
export const usePositionSpring = (
  initialPosition: Position,
  config: SpringConfig = SPRING_PRESETS.bouncy
) => {
  const xSpring = useSpringValue(initialPosition.x, config);
  const ySpring = useSpringValue(initialPosition.y, config);

  return {
    set: (target: Position) => {
      xSpring.set(target.x);
      ySpring.set(target.y);
    },
    get position(): Position {
      return { x: xSpring.value, y: ySpring.value };
    },
    get isAtRest(): boolean {
      return xSpring.isAtRest && ySpring.isAtRest;
    },
    update: (deltaTime?: number) => {
      xSpring.update(deltaTime);
      ySpring.update(deltaTime);
    }
  };
};