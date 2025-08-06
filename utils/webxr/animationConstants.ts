/**
 * WebXR Animation Constants
 * Centralized spring physics configurations to eliminate code duplication
 */

// Pre-allocated constants for performance
export const SPRING_AXES: readonly ('x' | 'y' | 'z')[] = [
  'x',
  'y',
  'z',
] as const
export const FRAME_RATE_LIMIT = 1 / 30 // Cap delta to prevent large jumps
export const DEFAULT_PRECISION = 0.001

// Spring configuration interfaces
export interface SpringConfig {
  tension: number
  friction: number
  mass: number
  precision?: number
}

// Standard spring configurations used across WebXR components
export const SPRING_CONFIGS = {
  // Hero Section Animations - Faster response for immediate feedback
  heroPosition: {
    tension: 200,
    friction: 20,
    mass: 0.8,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  heroScale: {
    tension: 300, // Very fast scale changes for immediate visibility
    friction: 25,
    mass: 0.5,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  heroOpacity: {
    tension: 300, // Very fast opacity changes for immediate visibility
    friction: 25, 
    mass: 0.5,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  // Navigation Animations
  navScale: {
    tension: 300,
    friction: 30,
    mass: 0.5,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  // Work Section Animations
  workPosition: {
    tension: 80,
    friction: 20,
    mass: 1.2,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  workOpacity: {
    tension: 120,
    friction: 25,
    mass: 1,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  // Work Title Animations - Faster for immediate appearance
  workTitlePosition: {
    tension: 180,
    friction: 18,
    mass: 1.0,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  workTitleScale: {
    tension: 250,
    friction: 22,
    mass: 0.8,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  workTitleRotation: {
    tension: 150,
    friction: 30,
    mass: 1,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  // Work Card Animations - Faster for immediate appearance
  cardPosition: {
    tension: 150,
    friction: 18,
    mass: 1.0,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  cardScale: {
    tension: 350,
    friction: 28,
    mass: 0.6,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  cardHover: {
    tension: 200,
    friction: 25,
    mass: 1,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  // General purpose configs
  fast: {
    tension: 300,
    friction: 30,
    mass: 0.5,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  medium: {
    tension: 170,
    friction: 26,
    mass: 1,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,

  slow: {
    tension: 80,
    friction: 20,
    mass: 1.5,
    precision: DEFAULT_PRECISION,
  } as SpringConfig,
} as const

// Predefined positions for entrance animations
// Standard WebXR depth hierarchy: UI (-2) > Main Content (-8) > Background (-20)
export const ENTRANCE_POSITIONS = {
  // Navigation layer - always on top for interaction
  navWorkButton: [4, 4, -2] as [number, number, number],
  
  // Hero section - main content layer when active
  heroDefault: [0, 2, -8] as [number, number, number], // Standard WebXR content distance
  heroHidden: [0, 2, -20] as [number, number, number], // Background layer when inactive
  
  // Work section - same main content layer as hero when active  
  workDefault: [0, 0, -8] as [number, number, number], // Centered at main content depth
  workHidden: [0, -10, -8] as [number, number, number], // Starts from bottom, same depth layer
}

// Performance constants
export const PERFORMANCE_CONFIG = {
  maxDeltaTime: FRAME_RATE_LIMIT,
  materialCacheSize: 50,
  animationThreshold: 0.01,
} as const
