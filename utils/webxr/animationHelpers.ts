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
    position: { x: 0, y: 2, z: -30 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0.8, y: 0.8, z: 0.8 },
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

export function interpolateVector3(start: Vector3, end: Vector3, progress: number): Vector3 {
  return new Vector3(
    start.x + (end.x - start.x) * progress,
    start.y + (end.y - start.y) * progress,
    start.z + (end.z - start.z) * progress
  )
}

export function interpolateAnimationState(
  start: AnimationState,
  end: AnimationState,
  progress: number
): AnimationState {
  return {
    position: {
      x: start.position.x + (end.position.x - start.position.x) * progress,
      y: start.position.y + (end.position.y - start.position.y) * progress,
      z: start.position.z + (end.position.z - start.position.z) * progress,
    },
    rotation: {
      x: start.rotation.x + (end.rotation.x - start.rotation.x) * progress,
      y: start.rotation.y + (end.rotation.y - start.rotation.y) * progress,
      z: start.rotation.z + (end.rotation.z - start.rotation.z) * progress,
    },
    scale: {
      x: start.scale.x + (end.scale.x - start.scale.x) * progress,
      y: start.scale.y + (end.scale.y - start.scale.y) * progress,
      z: start.scale.z + (end.scale.z - start.scale.z) * progress,
    },
    opacity: start.opacity + (end.opacity - start.opacity) * progress,
  }
}