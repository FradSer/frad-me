import type { Position } from '@/types/common';

// Use consistent Position type from common types
export type AnimationPosition = Position & { z: number };

export interface AnimationState {
  position: AnimationPosition;
  rotation: AnimationPosition;
  scale: AnimationPosition;
  opacity: number;
}

// Utility to create consistent animation position
export const createAnimationPosition = (x = 0, y = 0, z = 0): AnimationPosition => ({ x, y, z });

export const heroAnimationStates = {
  home: {
    position: createAnimationPosition(0, 1, -10), // Lowered hero text position
    rotation: createAnimationPosition(),
    scale: createAnimationPosition(1, 1, 1),
    opacity: 1,
  },
  hidden: {
    position: createAnimationPosition(0, -5, -40),
    rotation: createAnimationPosition(),
    scale: createAnimationPosition(0.6, 0.6, 0.6),
    opacity: 0,
  },
} as const;

export const workCardPositions = {
  entrance: createAnimationPosition(2.5, 2.5, -8), // Start from navigation button position but further back
  display: createAnimationPosition(),
  hover: createAnimationPosition(0, 1, -2), // Increased forward movement for more noticeable hover effect
} as const;

// Note: Interpolation functions removed as they're duplicated in
// @/components/WebXR/shared/AnimationHelpers.tsx
// Use custom spring animation system for better performance
