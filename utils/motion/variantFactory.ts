import { primaryTransition } from './springTransitions'

/**
 * Factory functions for creating consistent animation variants
 */

export const TRANSITION_OFFSET = { x: '-50%', y: '-50%' }

export type CursorVariantConfig = {
  size?: string
  opacity?: number
  scale?: number
  transition?: any
}

export const createCursorVariant = (config: CursorVariantConfig) => ({
  ...TRANSITION_OFFSET,
  ...(config.size && { height: config.size, width: config.size }),
  ...(config.opacity !== undefined && { opacity: config.opacity }),
  ...(config.scale !== undefined && { scale: config.scale }),
  transition: config.transition || primaryTransition,
})

export const createBackgroundVariants = () => ({
  initial: createCursorVariant({ size: '1rem', opacity: 1 }),
  headerLinkHovered: createCursorVariant({ opacity: 0 }),
  workCardHover: createCursorVariant({ size: '4rem' }),
  attracted: createCursorVariant({ size: '1rem', opacity: 0 }),
})

export const createTextVariants = () => ({
  initial: createCursorVariant({ size: '2rem', opacity: 0, scale: 0.5 }),
  workCardHover: createCursorVariant({ size: '4rem', opacity: 1, scale: 1 }),
})