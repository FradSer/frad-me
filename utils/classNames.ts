import classNames from 'classnames'

/**
 * Utility functions for common className patterns
 */

export const createCursorClasses = (baseClasses: string, conditionalClasses?: Record<string, boolean>) =>
  classNames(baseClasses, conditionalClasses)

export const CURSOR_BASE_CLASSES = {
  text: 'fixed flex items-center justify-center duration-200 pointer-events-none text-black font-bold text-xl z-50',
  background: 'fixed rounded-full bg-white pointer-events-none z-40 duration-100',
} as const

export const LAYOUT_CLASSES = {
  fullScreen: 'fixed inset-0 z-50 flex items-center justify-center',
  centerFlex: 'flex items-center justify-center',
  loadingText: 'text-4xl font-bold md:text-7xl',
} as const