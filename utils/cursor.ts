import type { CursorType } from '@/contexts/Mouse/MouseContext'

/**
 * Cursor state configuration and utilities
 */

export type CursorState = {
  animation: string
  title: string
  opacity?: number
}

export const CURSOR_STATES: Record<CursorType, CursorState> = {
  'default': { animation: 'initial', title: '' },
  'header-link-hovered': { animation: 'headerLinkHovered', title: '' },
  'work-card-hovered': { animation: 'workCardHover', title: 'READ' },
  'work-card-hovered-wip': { animation: 'workCardHover', title: 'WIP' },
  'attracted': { animation: 'attracted', title: '' },
} as const

export const getCursorState = (cursorType: CursorType): CursorState => 
  CURSOR_STATES[cursorType] || CURSOR_STATES.default

export const shouldShowBackground = (cursorType: CursorType): boolean =>
  cursorType === 'default' || cursorType === 'work-card-hovered' || cursorType === 'work-card-hovered-wip'

export const shouldShowText = (cursorType: CursorType): boolean =>
  cursorType === 'work-card-hovered' || cursorType === 'work-card-hovered-wip'