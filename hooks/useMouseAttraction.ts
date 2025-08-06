import { useEffect } from 'react'

import { useMotionValue, useSpring } from 'framer-motion'

import type { Position } from '@/types/common'
import useMouseContext from '@/hooks/useMouseContext'
import useMousePosition from '@/hooks/useMousePosition'
import { calculateBlendPosition } from '@/utils/motion/animationHelpers'

type UseMouseAttractionProps = {
  blendFactor?: number
  springConfig?: {
    stiffness: number
    damping: number
  }
}

/**
 * Custom hook for mouse attraction with spring physics
 * Consolidates mouse position tracking and spring animation logic
 */
export default function useMouseAttraction({
  blendFactor = 0.7,
  springConfig = { stiffness: 300, damping: 30 }
}: UseMouseAttractionProps = {}) {
  const mousePosition = useMousePosition()
  const { attractorPosition } = useMouseContext()

  const attractedX = useMotionValue(mousePosition.x)
  const attractedY = useMotionValue(mousePosition.y)
  
  const springX = useSpring(attractedX, springConfig)
  const springY = useSpring(attractedY, springConfig)

  useEffect(() => {
    const blendedPosition = calculateBlendPosition(
      mousePosition,
      attractorPosition,
      blendFactor
    )
    
    attractedX.set(blendedPosition.x)
    attractedY.set(blendedPosition.y)
  }, [mousePosition, attractorPosition, attractedX, attractedY, blendFactor])

  return {
    springX,
    springY,
    mousePosition,
    attractorPosition
  }
}