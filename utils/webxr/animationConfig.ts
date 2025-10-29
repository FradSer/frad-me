// Simplified type definitions
export interface SpringConfig {
  tension: number;
  friction: number;
}

export type Vec3 = readonly [number, number, number];
export type AnimationPreset = 'slow' | 'normal' | 'fast' | 'bouncy' | 'elastic';
export type QualityLevel = 'reduced' | 'normal' | 'high';

// Simplified animation configuration
export const WEBXR_ANIMATION_CONFIG = {
  springs: {
    slow: { tension: 180, friction: 20 },
    normal: { tension: 280, friction: 28 },
    fast: { tension: 450, friction: 35 },
    bouncy: { tension: 320, friction: 22 },
    elastic: { tension: 400, friction: 25 },
  } as const,

  timing: {
    delays: {
      cardStagger: 150,
      cardEntranceDelay: 400,
      breathingInterval: 2500,
      breathingDuration: 1000,
    },
    durations: {
      cardAnimation: 1200,
      viewTransition: 800,
      hoverResponse: 200,
    },
  } as const,

  positions: {
    workCards: {
      entrance: [2.5, 2.5, -8] as Vec3,
      geometry: [4.5, 3, 1] as Vec3,
      hover: { x: 0, y: 1, z: -2 },
      rotation: {
        idle: 0,
        hover: 0.1,
      },
    },
    camera: {
      home: { position: [0, 0, 5] as Vec3, lookAt: [0, 0, 0] as Vec3, fov: 75 },
      work: { position: [0, 2, 8] as Vec3, lookAt: [0, 0, 0] as Vec3, fov: 65 },
    },
    navigation: {
      button: [2.5, 2.5, 0] as Vec3,
      breathingAmplitude: 0.1,
    },
    hero: {
      visible: [0, 1, -10] as Vec3,
      hidden: [0, -5, -40] as Vec3,
    },
  } as const,

  scales: {
    default: 1.0,
    hover: 1.1,
    breathing: 1.05,
    entrance: 0.8,
  } as const,

  opacity: {
    visible: 1.0,
    hidden: 0.0,
  } as const,

  performance: {
    hideThreshold: 0.01,
    fpsThreshold: 30,
    highQualityThreshold: 50,
  } as const,
} as const;

// Simple validation functions
export function isValidSpring(config: unknown): config is SpringConfig {
  const springConfig = config as Record<string, unknown> | null | undefined;
  return (
    typeof springConfig?.tension === 'number' &&
    typeof springConfig?.friction === 'number' &&
    springConfig.tension > 0 &&
    springConfig.friction > 0
  );
}

export function validateAnimationPreset(preset: string): AnimationPreset | false {
  return preset in WEBXR_ANIMATION_CONFIG.springs ? (preset as AnimationPreset) : false;
}

// Simple performance state
let currentFPS = 60;

// Core animation functions
export function getLerpSpeed(preset: AnimationPreset): number {
  const spring = WEBXR_ANIMATION_CONFIG.springs[preset];
  return Math.min(spring.tension / spring.friction / 10, 1);
}

export function updateFPS(fps: number): void {
  currentFPS = fps;
}

export function getQualityLevel(): QualityLevel {
  if (currentFPS >= WEBXR_ANIMATION_CONFIG.performance.highQualityThreshold) return 'high';
  if (currentFPS >= WEBXR_ANIMATION_CONFIG.performance.fpsThreshold) return 'normal';
  return 'reduced';
}

export function getAdaptiveSpring(preset: AnimationPreset): SpringConfig {
  const base = WEBXR_ANIMATION_CONFIG.springs[preset];

  if (currentFPS < WEBXR_ANIMATION_CONFIG.performance.fpsThreshold) {
    return {
      tension: base.tension * 1.5,
      friction: base.friction * 1.2,
    };
  }

  return base;
}

export function shouldHideComponent(opacity: number): boolean {
  return opacity < WEBXR_ANIMATION_CONFIG.performance.hideThreshold;
}

// Utility functions
export function getStaggerDelay(index: number, baseDelay?: number): number {
  const delay = baseDelay ?? WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger;
  return index * delay;
}

// Backward compatibility
export function getCompatibleSpringConfig(preset: AnimationPreset): SpringConfig {
  return WEBXR_ANIMATION_CONFIG.springs[preset];
}

// Development validation
if (process.env.NODE_ENV === 'development') {
  Object.values(WEBXR_ANIMATION_CONFIG.springs).forEach((spring, index) => {
    if (!isValidSpring(spring)) {
      console.warn(`Invalid spring configuration at index ${index}:`, spring);
    }
  });
}
