// Animation and interaction constants
export const INTERACTION_CONSTANTS = {
  // Interactive mesh scale multipliers
  HOVER_SCALE: 1.1,
  ACTIVE_SCALE: 1.3,
  DEFAULT_SCALE: 1,

  // Rotation speeds
  DEFAULT_ROTATION_SPEED: 10,
  FAST_ROTATION_SPEED: 5,

  // Spring rotation multipliers
  ACTIVE_ROTATION: 2,
  HOVER_ROTATION: 1,
  SECONDARY_ROTATION_FACTOR: 0.5,
} as const;

// Geometry constants
export const GEOMETRY_CONSTANTS = {
  // Box geometry
  BOX_DIMENSIONS: [3, 1, 1] as [number, number, number],

  // Cone geometry (Triangle)
  CONE_RADIUS: 1,
  CONE_HEIGHT: 1.4,
  CONE_SEGMENTS: 3,
  CONE_TAPER: 1,

  // Sphere geometry
  SPHERE_RADIUS: 0.65,
  SPHERE_WIDTH_SEGMENTS: 16,
  SPHERE_HEIGHT_SEGMENTS: 16,

  // Scale multipliers
  TRIANGLE_SCALE: 1.5,
  SPHERE_SCALE: 1.5,
  MINI_TRIANGLE_SCALE: 0.5,
} as const;

// Light constants
export const LIGHT_CONSTANTS = {
  AMBIENT_INTENSITY: Math.PI / 10,
  POINT_LIGHT_INTENSITY: Math.PI,
  SECONDARY_LIGHT_INTENSITY: 0.5,
  POINT_LIGHT_POSITION: [-10, -10, -10] as const,
  SECONDARY_LIGHT_POSITION: [-5, 2, -2] as const,
  SECONDARY_LIGHT_COLOR: '#4F46E5',
} as const;

// Font constants
export const FONT_CONSTANTS = {
  DEFAULT_FONT_SIZE: 1,
  HERO_FONT_PATH: 'fonts/GT-Eesti-Display-Bold-Trial.woff',
  FALLBACK_FONT_SIZE: 0.5,
  FALLBACK_FONT_COLOR: '#FF6B6B',
  FALLBACK_MAX_WIDTH: 200,
} as const;

// Performance thresholds
export const PERFORMANCE_CONSTANTS = {
  VISIBILITY_THRESHOLD: 0.01,
  DEFAULT_CANVAS_SIZE: { width: 800, height: 600 },
  DEFAULT_PIXEL_RATIO: 1,
} as const;