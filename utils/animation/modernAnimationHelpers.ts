import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simplified animation types
export type AnimationType = 'float' | 'rotate' | 'scale' | 'pulse' | 'orbit';
export type Axis = 'x' | 'y' | 'z';
export type EasingFunction = (t: number) => number;

// Unified animation configuration
export interface AnimationConfig {
  speed?: number;
  intensity?: number;
  delay?: number;
  enabled?: boolean;
  easing?: EasingFunction;
  // Type-specific properties (simplified)
  amplitude?: number;    // float
  min?: number;         // scale, pulse
  max?: number;         // scale, pulse
  axis?: Axis | 'all';  // rotate, orbit
  radius?: number;      // orbit
}

// Common easing functions
export const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t),
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  sine: (t: number) => Math.sin((t * Math.PI) / 2),
  bounce: (t: number) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
} as const;

// Default configurations
const DEFAULT_CONFIGS: Record<AnimationType, AnimationConfig> = {
  float: { speed: 1, intensity: 1, amplitude: 0.5, easing: easingFunctions.sine },
  rotate: { speed: 1, intensity: 1, axis: 'y', easing: easingFunctions.linear },
  scale: { speed: 2, intensity: 1, min: 0.9, max: 1.1, easing: easingFunctions.easeInOut },
  pulse: { speed: 2, intensity: 1, min: 0.3, max: 1.0, easing: easingFunctions.sine },
  orbit: { speed: 0.5, intensity: 1, radius: 2, axis: 'y', easing: easingFunctions.linear },
} as const;

// Animation state calculation (simplified)
const calculateAnimationTime = (
  time: number,
  speed: number,
  delay: number,
  easing: EasingFunction
): number => {
  const adjustedTime = (time - delay) * speed;
  return adjustedTime > 0 ? easing(Math.abs(Math.sin(adjustedTime)) % 1) : 0;
};

// Individual animation functions (simplified and optimized)
const animations = {
  float: (object: THREE.Object3D, easedTime: number, config: AnimationConfig, initialPos?: THREE.Vector3) => {
    const { amplitude = 0.5, intensity = 1 } = config;
    const offset = Math.sin(easedTime * Math.PI * 2) * amplitude * intensity;
    if (initialPos) {
      object.position.y = initialPos.y + offset;
    }
  },
  
  rotate: (object: THREE.Object3D, rawTime: number, config: AnimationConfig) => {
    const { axis = 'y', intensity = 1, speed = 1 } = config;
    const rotation = rawTime * speed * intensity;
    
    if (axis === 'all') {
      object.rotation.set(rotation, rotation, rotation);
    } else {
      object.rotation[axis as Axis] = rotation;
    }
  },
  
  scale: (object: THREE.Object3D, easedTime: number, config: AnimationConfig) => {
    const { min = 0.8, max = 1.2, intensity = 1 } = config;
    const scale = min + (max - min) * easedTime * intensity;
    object.scale.setScalar(scale);
  },
  
  pulse: (object: THREE.Object3D, easedTime: number, config: AnimationConfig) => {
    const { min = 0.2, max = 1.0, intensity = 1 } = config;
    const pulseValue = min + (max - min) * easedTime * intensity;
    
    // Apply to material opacity if available
    object.traverse((child) => {
      if ('material' in child && child.material) {
        const material = child.material as THREE.Material & { opacity?: number };
        if (material.opacity !== undefined) {
          material.opacity = pulseValue;
        }
      }
    });
  },
  
  orbit: (object: THREE.Object3D, rawTime: number, config: AnimationConfig, initialPos?: THREE.Vector3) => {
    if (!initialPos) return;
    
    const { radius = 2, axis = 'y', intensity = 1, speed = 1 } = config;
    const angle = rawTime * speed;
    const r = radius * intensity;
    
    if (axis === 'y') {
      object.position.set(
        initialPos.x + Math.cos(angle) * r,
        initialPos.y,
        initialPos.z + Math.sin(angle) * r
      );
    }
  },
} as const;

/**
 * Simplified animation hook factory
 */
const createAnimationHook = (
  type: AnimationType,
  needsInitialPosition = false
) => {
  return (config: AnimationConfig = {}) => {
    const ref = useRef<THREE.Object3D>(null);
    const initialPosition = useRef<THREE.Vector3 | null>(null);
    const hasInitialized = useRef(false);

    const finalConfig = useMemo(
      () => ({ enabled: true, ...DEFAULT_CONFIGS[type], ...config }),
      [config]
    );

    useFrame((state) => {
      if (!ref.current || !finalConfig.enabled) return;
      
      // Initialize position if needed
      if (needsInitialPosition && !hasInitialized.current) {
        initialPosition.current = ref.current.position.clone();
        hasInitialized.current = true;
      }

      const { speed = 1, delay = 0, easing = easingFunctions.linear } = finalConfig;
      const rawTime = state.clock.elapsedTime;
      const easedTime = calculateAnimationTime(rawTime, speed, delay, easing);

      animations[type](
        ref.current,
        type === 'rotate' || type === 'orbit' ? rawTime : easedTime,
        finalConfig,
        needsInitialPosition ? (initialPosition.current ?? undefined) : undefined
      );
    });

    return ref;
  };
};

// Export simplified hooks
export const useFloatAnimation = createAnimationHook('float', true);
export const useRotationAnimation = createAnimationHook('rotate', false);
export const useScaleAnimation = createAnimationHook('scale', false);
export const usePulseAnimation = createAnimationHook('pulse', false);
export const useOrbitAnimation = createAnimationHook('orbit', true);

/**
 * Combined animation hook for multiple effects
 */
export const useCombinedAnimation = (
  animationConfigs: Array<{ type: AnimationType; config?: AnimationConfig }>
) => {
  const ref = useRef<THREE.Object3D>(null);
  const initialPosition = useRef<THREE.Vector3 | null>(null);
  const hasInitialized = useRef(false);
  
  const needsInitialPosition = animationConfigs.some(({ type }) => 
    type === 'float' || type === 'orbit'
  );

  useFrame((state) => {
    if (!ref.current) return;
    
    // Initialize position if needed
    if (needsInitialPosition && !hasInitialized.current) {
      initialPosition.current = ref.current.position.clone();
      hasInitialized.current = true;
    }

    // Apply all animations
    animationConfigs.forEach(({ type, config = {} }) => {
      const finalConfig = { enabled: true, ...DEFAULT_CONFIGS[type], ...config };
      if (!finalConfig.enabled) return;

      const { speed = 1, delay = 0, easing = easingFunctions.linear } = finalConfig;
      const rawTime = state.clock.elapsedTime;
      const easedTime = calculateAnimationTime(rawTime, speed, delay, easing);

      animations[type](
        ref.current!,
        type === 'rotate' || type === 'orbit' ? rawTime : easedTime,
        finalConfig,
        needsInitialPosition ? (initialPosition.current ?? undefined) : undefined
      );
    });
  });

  return ref;
};

// Export all animation utilities as a namespace for backward compatibility
export const ModernAnimationHelpers = {
  useFloatAnimation,
  useRotationAnimation,
  useScaleAnimation,
  usePulseAnimation,
  useOrbitAnimation,
  useCombinedAnimation,
  easingFunctions,
} as const;