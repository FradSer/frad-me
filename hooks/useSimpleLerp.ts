import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface LerpConfig {
  speed: number; // Lerp speed multiplier (higher = faster)
}

const EPSILON = 0.0001;

/**
 * Simplified animation hook using R3F's useFrame and THREE.MathUtils.lerp
 * Replaces custom SpringScalar with built-in THREE.js interpolation
 */
export const useSimpleLerp = (initialValue: number, config: LerpConfig) => {
  const currentRef = useRef(initialValue);
  const targetRef = useRef(initialValue);

  useFrame((_, delta) => {
    // Performance optimization: skip calculation if close enough to target
    if (Math.abs(currentRef.current - targetRef.current) < EPSILON) {
      if (currentRef.current !== targetRef.current) {
        currentRef.current = targetRef.current;
      }
      return;
    }

    const speed = config.speed * delta * 10; // Simplified speed calculation
    currentRef.current = THREE.MathUtils.lerp(currentRef.current, targetRef.current, speed);
  });

  return {
    get value() {
      return currentRef.current;
    },
    set(target: number) {
      targetRef.current = target;
    },
  };
};

// Convert spring config to lerp speed approximation
export const springConfigToLerpSpeed = (springConfig: { tension: number; friction: number }) => {
  // Approximate conversion: higher tension = faster, higher friction = slower
  return Math.min(springConfig.tension / springConfig.friction / 10, 1);
};
