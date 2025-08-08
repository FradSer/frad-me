import type { Transition } from 'framer-motion'
import { primaryTransition } from './springTransitions'

/**
 * Factory functions for creating consistent animation variants
 */

export const TRANSITION_OFFSET = { x: '-50%', y: '-50%' }

/**
 * Configuration for cursor animation variants
 */
export interface CursorVariantConfig {
  size?: string
  opacity?: number
  scale?: number
  transition?: Transition
}

/**
 * Creates a cursor animation variant with consistent offset and transition
 * 
 * @param config - Configuration for the cursor variant
 * @returns Complete cursor variant object for Framer Motion
 */
export const createCursorVariant = (config: CursorVariantConfig) => ({
  ...TRANSITION_OFFSET,
  ...(config.size && { height: config.size, width: config.size }),
  ...(config.opacity !== undefined && { opacity: config.opacity }),
  ...(config.scale !== undefined && { scale: config.scale }),
  transition: config.transition || primaryTransition,
})

/**
 * Creates standard background cursor animation variants
 * 
 * @returns Object containing all background cursor animation states
 */
export const createBackgroundVariants = () => ({
  initial: createCursorVariant({ size: '1rem', opacity: 1 }),
  headerLinkHovered: createCursorVariant({ opacity: 0 }),
  workCardHover: createCursorVariant({ size: '4rem' }),
  attracted: createCursorVariant({ size: '1rem', opacity: 0 }),
})

/**
 * Creates standard text cursor animation variants
 * 
 * @returns Object containing all text cursor animation states
 */
export const createTextVariants = () => ({
  initial: createCursorVariant({ size: '2rem', opacity: 0, scale: 0.5 }),
  workCardHover: createCursorVariant({ size: '4rem', opacity: 1, scale: 1 }),
})