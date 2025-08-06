import { useAnimationControls } from 'framer-motion'

import { primaryTransition } from './springTransitions'

// Common animation variant factory
export const createVariants = (variants: Record<string, any>) => {
  const withTransition = (variant: any) => ({
    ...variant,
    transition: variant.transition || primaryTransition,
  })

  return Object.keys(variants).reduce(
    (acc, key) => {
      acc[key] = withTransition(variants[key])
      return acc
    },
    {} as Record<string, any>,
  )
}

// Animation state manager hook
export const useAnimationGroup = (animationKeys: string[]) => {
  const controls = animationKeys.reduce(
    (acc, key) => {
      acc[key] = useAnimationControls()
      return acc
    },
    {} as Record<string, ReturnType<typeof useAnimationControls>>,
  )

  const startAll = (state: string) => {
    Object.values(controls).forEach((control) => control.start(state))
  }

  const startGroup = (stateMap: Record<string, string>) => {
    Object.entries(stateMap).forEach(([key, state]) => {
      controls[key]?.start(state)
    })
  }

  return { controls, startAll, startGroup }
}

// Common blend calculation for mouse attraction
export const calculateBlendPosition = (
  mousePos: { x: number; y: number },
  attractorPos: { x: number; y: number } | null,
  blendFactor: number = 0.7,
) => {
  if (!attractorPos) return mousePos

  return {
    x: mousePos.x + (attractorPos.x - mousePos.x) * blendFactor,
    y: mousePos.y + (attractorPos.y - mousePos.y) * blendFactor,
  }
}

// Distance calculation utility
export const calculateDistance = (
  point1: { x: number; y: number },
  point2: { x: number; y: number },
) => Math.hypot(point1.x - point2.x, point1.y - point2.y)
