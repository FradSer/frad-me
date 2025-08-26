import * as THREE from 'three';
import { z } from 'zod';

// Type definitions for the animation system
export interface SpringConfig {
  tension: number;
  friction: number;
}

export interface TimingConfig {
  delays: {
    cardStagger: number;
    sectionTransition: number;
    cardEntranceDelay: number;
    breathingInterval: number;
    breathingDuration: number;
  };
  durations: {
    cardAnimation: number;
    viewTransition: number;
    hoverResponse: number;
    fadeTransition: number;
    cameraTransition: number;
    navigationToggle: number;
  };
}

export interface PositionConfig {
  workCards: {
    entrance: readonly [number, number, number];
    grid: Record<string, readonly [number, number, number]>;
    exit: readonly [number, number, number];
    geometry: readonly [number, number, number];
    hover: {
      x: number;
      y: number;
      z: number;
    };
  };
  camera: {
    home: {
      position: readonly [number, number, number];
      lookAt: readonly [number, number, number];
      fov: number;
    };
    work: {
      position: readonly [number, number, number];
      lookAt: readonly [number, number, number];
      fov: number;
    };
  };
  navigation: {
    group: readonly [number, number, number];
    button: readonly [number, number, number];
    absolutePosition: readonly [number, number, number];
    breathingAmplitude: number;
  };
  footer: {
    group: readonly [number, number, number];
    externalLinks: readonly [number, number, number];
  };
  workGrid: {
    title: readonly [number, number, number];
    directionalLight: readonly [number, number, number];
    pointLight: readonly [number, number, number];
  };
  hero: {
    visible: readonly [number, number, number];
    hidden: readonly [number, number, number];
  };
}

export interface ScaleConfig {
  default: number;
  hover: number;
  active: number;
  breathing: number;
  hidden: number;
  entrance: number;
}

export interface OpacityConfig {
  visible: number;
  hidden: number;
  visibilityThreshold: number;
  hoverHighlight: number;
}

export interface PerformanceConfig {
  hideThreshold: number;
  frameSkip: boolean;
  lerpFactor: number;
  adaptiveQuality: boolean;
  fpsThreshold: number;
  qualityLevels: readonly ['reduced', 'normal', 'high'];
}

export interface AnimationCurveConfig {
  cameraMovement: { speed: number };
  cameraFov: { speed: number };
  heroTransition: { speed: number };
  cardEntrance: { speed: number };
}

// Main animation configuration object
export const WEBXR_ANIMATION_CONFIG = {
  // Spring physics configurations with enhanced presets
  springs: {
    slow: { tension: 180, friction: 20 },      // Enhanced gentle animations
    normal: { tension: 280, friction: 28 },    // Enhanced standard animations 
    fast: { tension: 450, friction: 35 },      // Enhanced quick responses
    bouncy: { tension: 320, friction: 22 },    // Extra bouncy effects
    elastic: { tension: 400, friction: 25 },   // Elastic entrance effects
  } as const,
  
  // Comprehensive timing configurations
  timing: {
    delays: {
      cardStagger: 150,           // ms between card animations (converted from 0.15s)
      sectionTransition: 300,     // ms for section transitions (converted from 0.3s)
      cardEntranceDelay: 400,     // ms base delay for card entrance (converted from 0.4s)
      breathingInterval: 2500,    // ms breathing animation interval
      breathingDuration: 1000,    // ms breathing animation duration
    },
    durations: {
      cardAnimation: 1200,        // ms for card animation duration
      viewTransition: 800,        // ms for view transitions
      hoverResponse: 200,         // ms for hover feedback
      fadeTransition: 800,        // ms for opacity transitions
      cameraTransition: 1200,     // ms for camera movements
      navigationToggle: 300,      // ms for nav button states
    },
  } as const,
  
  // Comprehensive position configurations
  positions: {
    workCards: {
      entrance: [2.5, 2.5, -8] as const,    // Start from navigation button position
      grid: {} as Record<string, readonly [number, number, number]>, // Computed grid positions
      exit: [2.5, 2.5, -8] as const,        // Return to entrance position
      geometry: [4.5, 3, 1] as const,       // Larger planeGeometry args
      hover: {
        x: 0,
        y: 1,         // Increased forward movement
        z: -2,        // More noticeable hover effect
      },
      rotation: {
        hover: 0.1,   // Subtle rotation on hover for interactive feedback
        idle: 0,      // No rotation when not hovered
      },
    },
    camera: {
      home: {
        position: [0, 0, 5] as const,
        lookAt: [0, 0, 0] as const,
        fov: 75,
      },
      work: {
        position: [0, 2, 8] as const,
        lookAt: [0, 0, 0] as const,
        fov: 65,
      },
    },
    navigation: {
      group: [0, 0, -1] as const,
      button: [2.5, 2.5, 0] as const,
      absolutePosition: [2.5, 2.5, -1] as const, // Computed absolute position
      breathingAmplitude: 0.1,
    },
    footer: {
      group: [0, 0, -4] as const,
      externalLinks: [3.5, -3, 0] as const,
    },
    workGrid: {
      title: [0, 5, 0] as const,
      directionalLight: [5, 5, 5] as const,
      pointLight: [-5, 3, 2] as const,
    },
    hero: {
      visible: [0, 1, -10] as const,  // Lowered hero text position
      hidden: [0, -5, -40] as const,  // Far and low for smooth transitions
    },
  } as const,
  
  // Scale configurations for consistent sizing
  scales: {
    default: 1.0,
    hover: 1.1,
    active: 1.3,
    breathing: 1.05,
    hidden: 0.1,
    entrance: 0.1,   // Start small for entrance effect
  } as const,
  
  // Opacity configurations for visibility management
  opacity: {
    visible: 1.0,
    hidden: 0.0,
    visibilityThreshold: 0.01,  // Hide elements below this opacity (WebXR best practice)
    hoverHighlight: 0.2,        // Glow effect opacity
  } as const,
  
  // Animation curves for different movement types
  curves: {
    cameraMovement: { speed: 2 },
    cameraFov: { speed: 3 },
    heroTransition: { speed: 0.8 },
    cardEntrance: { speed: 1.2 },
  } as const,
  
  // Performance settings for optimization
  performance: {
    hideThreshold: 0.01,        // Opacity threshold for hiding components
    frameSkip: false,           // Skip frames during heavy operations
    lerpFactor: 0.1,           // Default lerp interpolation factor
    adaptiveQuality: true,      // Enable adaptive quality based on performance
    fpsThreshold: 30,          // FPS threshold for quality reduction (normal/reduced boundary)
    highQualityThreshold: 50,  // FPS threshold for high quality level
    sampleSize: 10,            // Number of frames to sample for performance metrics
    qualityLevels: ['reduced', 'normal', 'high'] as const,
    adaptiveMultipliers: {
      tensionIncrease: 1.5,    // Multiplier to speed up animations on low FPS
      frictionIncrease: 1.2,   // Multiplier to add dampening on low FPS
    },
  } as const,
} as const;

// Type-safe animation preset type
export type AnimationPreset = keyof typeof WEBXR_ANIMATION_CONFIG.springs;
export type TimingPreset = keyof typeof WEBXR_ANIMATION_CONFIG.timing;
export type QualityLevel = typeof WEBXR_ANIMATION_CONFIG.performance.qualityLevels[number];

// Validation schemas using Zod
const SpringConfigSchema = z.object({
  tension: z.number().min(0).max(1000),
  friction: z.number().min(0).max(100),
});

const TimingConfigSchema = z.object({
  delays: z.record(z.string(), z.number().min(0)),
  durations: z.record(z.string(), z.number().min(0)),
});

const PositionArraySchema = z.tuple([z.number(), z.number(), z.number()]);

const HoverOffsetSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const CameraViewSchema = z.object({
  position: PositionArraySchema,
  lookAt: PositionArraySchema,
  fov: z.number().min(10).max(180),
});

const WorkCardsPositionSchema = z.object({
  entrance: PositionArraySchema,
  grid: z.record(z.string(), PositionArraySchema),
  exit: PositionArraySchema,
  geometry: PositionArraySchema,
  hover: HoverOffsetSchema,
  rotation: z.object({
    hover: z.number().min(-Math.PI).max(Math.PI),
    idle: z.number().min(-Math.PI).max(Math.PI),
  }),
});

const CameraPositionSchema = z.object({
  home: CameraViewSchema,
  work: CameraViewSchema,
});

const NavigationPositionSchema = z.object({
  group: PositionArraySchema,
  button: PositionArraySchema,
  absolutePosition: PositionArraySchema,
  breathingAmplitude: z.number().min(0).max(1),
});

const FooterPositionSchema = z.object({
  group: PositionArraySchema,
  externalLinks: PositionArraySchema,
});

const WorkGridPositionSchema = z.object({
  title: PositionArraySchema,
  directionalLight: PositionArraySchema,
  pointLight: PositionArraySchema,
});

const HeroPositionSchema = z.object({
  visible: PositionArraySchema,
  hidden: PositionArraySchema,
});

const PositionsConfigSchema = z.object({
  workCards: WorkCardsPositionSchema,
  camera: CameraPositionSchema,
  navigation: NavigationPositionSchema,
  footer: FooterPositionSchema,
  workGrid: WorkGridPositionSchema,
  hero: HeroPositionSchema,
});

const PerformanceConfigSchema = z.object({
  hideThreshold: z.number().min(0).max(1),
  frameSkip: z.boolean(),
  lerpFactor: z.number().min(0).max(1),
  adaptiveQuality: z.boolean(),
  fpsThreshold: z.number().min(10).max(120),
  highQualityThreshold: z.number().min(30).max(120),
  sampleSize: z.number().min(1).max(100),
  qualityLevels: z.array(z.enum(['reduced', 'normal', 'high'])),
  adaptiveMultipliers: z.object({
    tensionIncrease: z.number().min(1).max(3),
    frictionIncrease: z.number().min(1).max(3),
  }),
});

const AnimationConfigSchema = z.object({
  springs: z.record(z.string(), SpringConfigSchema),
  timing: TimingConfigSchema,
  positions: PositionsConfigSchema,
  scales: z.record(z.string(), z.number().min(0).max(10)),
  opacity: z.record(z.string(), z.number().min(0).max(1)),
  curves: z.record(z.string(), z.object({ speed: z.number().min(0) })),
  performance: PerformanceConfigSchema,
});

// Configuration validation function
export function validateAnimationConfig(config: unknown): any {
  try {
    // For partial configs (like in tests), provide default structure
    const partialConfig = config as Record<string, any>;
    const configToValidate = {
      springs: {},
      timing: { delays: {}, durations: {} },
      positions: {},
      scales: {},
      opacity: {},
      curves: {},
      performance: {
        hideThreshold: 0.01,
        frameSkip: false,
        lerpFactor: 0.1,
        adaptiveQuality: true,
        fpsThreshold: 30,
        highQualityThreshold: 50,
        sampleSize: 10,
        qualityLevels: ['reduced', 'normal', 'high'],
        adaptiveMultipliers: {
          tensionIncrease: 1.5,
          frictionIncrease: 1.2,
        },
      },
      ...partialConfig,
    };
    
    return AnimationConfigSchema.parse(configToValidate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid animation configuration: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }
    throw error;
  }
}

// Singleton AnimationConfigManager class
export class AnimationConfigManager {
  private static instance: AnimationConfigManager;
  private config: typeof WEBXR_ANIMATION_CONFIG;
  private lerpSpeedCache = new Map<AnimationPreset, number>();
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private averageFPS = 60;
  
  private constructor() {
    this.config = Object.freeze({ ...WEBXR_ANIMATION_CONFIG });
  }
  
  static getInstance(): AnimationConfigManager {
    if (!AnimationConfigManager.instance) {
      AnimationConfigManager.instance = new AnimationConfigManager();
    }
    return AnimationConfigManager.instance;
  }
  
  getConfig() {
    return this.config;
  }
  
  // Cached lerp speed conversion from spring config
  getLerpSpeed(springPreset: AnimationPreset): number {
    if (!this.lerpSpeedCache.has(springPreset)) {
      const spring = this.config.springs[springPreset];
      // Approximate conversion: higher tension = faster, higher friction = slower
      const speed = Math.min(spring.tension / spring.friction / 10, 1);
      this.lerpSpeedCache.set(springPreset, speed);
    }
    return this.lerpSpeedCache.get(springPreset)!;
  }
  
  // Update frame metrics for adaptive quality
  updateFrameMetrics(fps?: number) {
    if (fps !== undefined) {
      this.averageFPS = fps;
      return;
    }
    
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFrameTime > 1000) {
      this.averageFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }
  
  // Get adaptive configuration based on performance
  getAdaptiveConfig(basePreset: AnimationPreset): SpringConfig {
    const baseConfig = { ...this.config.springs[basePreset] };
    
    if (!this.config.performance.adaptiveQuality) {
      return baseConfig;
    }
    
    // Reduce animation complexity if FPS drops
    if (this.averageFPS < this.config.performance.fpsThreshold) {
      baseConfig.tension *= this.config.performance.adaptiveMultipliers.tensionIncrease; // Faster animations
      baseConfig.friction *= this.config.performance.adaptiveMultipliers.frictionIncrease; // More dampening
    }
    
    return baseConfig;
  }
  
  // Get current performance quality level
  getQualityLevel(): QualityLevel {
    if (this.averageFPS >= this.config.performance.highQualityThreshold) return 'high';
    if (this.averageFPS >= this.config.performance.fpsThreshold) return 'normal';
    return 'reduced';
  }
  
  // Utility function to check if component should be hidden
  shouldHideComponent(opacity: number): boolean {
    return opacity < this.config.performance.hideThreshold;
  }
}

// Convenience functions for common operations
export function getStaggerDelay(index: number, baseDelay = WEBXR_ANIMATION_CONFIG.timing.delays.cardStagger): number {
  return index * baseDelay;
}

export function shouldHideComponent(opacity: number): boolean {
  return opacity < WEBXR_ANIMATION_CONFIG.performance.hideThreshold;
}

export function getLerpSpeed(springPreset: AnimationPreset): number {
  return AnimationConfigManager.getInstance().getLerpSpeed(springPreset);
}

// Backward compatibility functions for migration
export function getCompatibleSpringConfig(preset: AnimationPreset): SpringConfig {
  return WEBXR_ANIMATION_CONFIG.springs[preset];
}

// Position utilities with caching
export class PositionManager {
  private static instance: PositionManager;
  private computedCache = new Map<string, THREE.Vector3>();
  
  static getInstance(): PositionManager {
    if (!PositionManager.instance) {
      PositionManager.instance = new PositionManager();
    }
    return PositionManager.instance;
  }
  
  getAbsolutePosition(parent: keyof typeof WEBXR_ANIMATION_CONFIG.positions, child: string): THREE.Vector3 {
    const cacheKey = `${parent}:${child}`;
    if (!this.computedCache.has(cacheKey)) {
      const parentConfig = WEBXR_ANIMATION_CONFIG.positions[parent] as Record<string, any>;
      
      // Handle different position configuration structures flexibly
      let parentPos: readonly [number, number, number] | null = null;
      let childPos: readonly [number, number, number] | null = null;
      
      // Try to find parent position (group, position, or base position)
      if (parentConfig?.group) {
        parentPos = parentConfig.group;
      } else if (parentConfig?.position) {
        parentPos = parentConfig.position;
      }
      
      // Try to find child position
      const childConfig = parentConfig?.[child];
      if (Array.isArray(childConfig) && childConfig.length === 3) {
        childPos = childConfig as unknown as readonly [number, number, number];
      } else if (childConfig?.position) {
        childPos = childConfig.position;
      }
      
      if (childPos) {
        let computed: THREE.Vector3;
        if (parentPos) {
          // Compute absolute position by adding parent and child vectors
          computed = new THREE.Vector3().addVectors(
            new THREE.Vector3().fromArray(parentPos),
            new THREE.Vector3().fromArray(childPos)
          );
        } else {
          // If no parent position, use child position directly
          computed = new THREE.Vector3().fromArray(childPos);
        }
        this.computedCache.set(cacheKey, computed);
      } else {
        // If child not found, create a default position and warn in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Position not found for ${parent}:${child}, using default [0,0,0]`);
        }
        this.computedCache.set(cacheKey, new THREE.Vector3());
      }
    }
    return this.computedCache.get(cacheKey) || new THREE.Vector3();
  }
  
  clearCache() {
    this.computedCache.clear();
  }
}

// Export the manager instance for convenience
export const animationConfigManager = AnimationConfigManager.getInstance();
export const positionManager = PositionManager.getInstance();

// Development-time validation
if (process.env.NODE_ENV === 'development') {
  try {
    validateAnimationConfig(WEBXR_ANIMATION_CONFIG);
  } catch (error) {
    console.error('WebXR Animation Configuration validation failed:', error);
  }
}