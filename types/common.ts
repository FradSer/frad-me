/**
 * Common shared types across the application
 */

export type Position = {
  readonly x: number
  readonly y: number
}

export type Size = {
  readonly width: number
  readonly height: number
}

export type Dimensions = Position & Size

export type AnimationState = 'initial' | 'animate' | 'exit'

export type ThemeMode = 'light' | 'dark' | 'system'

// Utility types for better type safety
export type NonEmptyArray<T> = readonly [T, ...T[]]

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>