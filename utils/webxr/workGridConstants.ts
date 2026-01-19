/**
 * WorkGrid3D specific constants
 * Extracted to improve readability and maintainability
 */

// Grid display configuration
export const WORK_GRID_CONFIG = {
  MAX_DISPLAY_WORKS: 5,
  WORKS_PER_ROW: 3,
  VISIBILITY_THRESHOLD: 0.01, // Opacity threshold below which components are hidden
} as const;

// Initial animation states for entrance effects
export const WORK_GRID_INITIAL_STATE = {
  OPACITY: 0,
  SCALE: 0.8,
  POSITION_Y_OFFSET: -2,
} as const;

// Target animation states for active view
export const WORK_GRID_ACTIVE_STATE = {
  OPACITY: 1,
  SCALE: 1,
  POSITION_Y_OFFSET: 0,
} as const;

// Lighting configuration for work grid
export const WORK_GRID_LIGHTING = {
  AMBIENT_INTENSITY: 0.4,
  DIRECTIONAL_INTENSITY: 0.8,
  POINT_INTENSITY: 0.6,
  POINT_COLOR: '#60a5fa',
} as const;
