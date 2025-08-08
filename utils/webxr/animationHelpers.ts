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
    position: { x: 0, y: 2, z: -10 },
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
  entrance: { x: 0, y: -15, z: -5 },
  display: { x: 0, y: 0, z: 0 },
  hover: { x: 0, y: 1, z: 2 },
} as const

export function createStaggeredDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay
}

// Note: Interpolation functions removed as they're duplicated in
// @/components/WebXR/shared/AnimationHelpers.tsx
// Use custom spring animation system for better performance