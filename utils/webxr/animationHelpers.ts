import { Vector3 } from 'three'

export interface AnimationPosition {
  x: number
  y: number
  z: number
}

export interface AnimationState {
  position: AnimationPosition
  rotation: AnimationPosition
  scale: AnimationPosition
  opacity: number
}

export const defaultAnimationState: AnimationState = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  opacity: 1,
}

export const heroAnimationStates = {
  home: {
    position: { x: 0, y: 1, z: -10 }, // Lowered hero text position
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    opacity: 1,
  },
  hidden: {
    position: { x: 0, y: -5, z: -40 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.6, y: 0.6, z: 0.6 },
    opacity: 0,
  },
} as const

export const workCardPositions = {
  entrance: { x: 2.5, y: 2.5, z: -8 }, // Start from navigation button position but further back
  display: { x: 0, y: 0, z: 0 },
  hover: { x: 0, y: 1, z: -2 }, // Increased forward movement for more noticeable hover effect
} as const

export function createStaggeredDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay
}

// Note: Interpolation functions removed as they're duplicated in
// @/components/WebXR/shared/AnimationHelpers.tsx
// Use custom spring animation system for better performance