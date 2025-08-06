// Grid classes used across work pages
export const GRID_CLASSES = {
  base: 'grid grid-cols-16 gap-y-3 md:gap-y-6',
  contentWrapper: 'col-span-16 col-start-1 md:col-span-10 md:col-start-7',
  fullWidth: 'col-span-16',
  listWrapper:
    'col-span-15 col-start-2 md:col-span-10 md:col-start-7 -mt-3 md:-mt-4',
} as const

// Image position classes for WorkImage components
export const IMAGE_POSITION_CLASSES = {
  inline: GRID_CLASSES.contentWrapper,
  underH2: GRID_CLASSES.contentWrapper,
  fullScreen: GRID_CLASSES.fullWidth,
} as const

// Common component classes
export const COMMON_CLASSES = {
  workComponentLayout: 'work-component-layout',
  workCaption: 'work-caption',
  imageContainer: 'w-full overflow-hidden',
} as const

// Animation constants
export const ANIMATION_CONSTANTS = {
  inViewDelay: 0.4,
  inViewDuration: 0.8,
} as const

// Site metadata
export const SITE_CONFIG = {
  domain: 'https://frad.me',
  title: 'Work by Frad',
} as const
