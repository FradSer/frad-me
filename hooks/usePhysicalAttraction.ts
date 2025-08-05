import { useEffect, useRef } from 'react'

import useMouseContext from './useMouseContext'
import useMousePosition from './useMousePosition'

interface UsePhysicalAttractionProps {
  elementRef: React.RefObject<HTMLElement>
  attractionRadius?: number
  isActive?: boolean
}

export default function usePhysicalAttraction({
  elementRef,
  attractionRadius = 100,
  isActive = true,
}: UsePhysicalAttractionProps) {
  const mouseContext = useMouseContext()
  const mousePosition = useMousePosition()
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isActive || !elementRef.current) return

    const checkAttraction = () => {
      const element = elementRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const elementCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }

      const distance = Math.sqrt(
        Math.pow(mousePosition.x - elementCenter.x, 2) +
          Math.pow(mousePosition.y - elementCenter.y, 2),
      )

      if (distance <= attractionRadius) {
        // Within attraction radius - set attractor position
        mouseContext.setAttractorPosition(elementCenter)
        mouseContext.cursorChangeHandler('attracted')
      } else if (mouseContext.attractorPosition) {
        // Outside attraction radius - reset
        mouseContext.setAttractorPosition(null)
        mouseContext.cursorChangeHandler('default')
      }

      animationFrameRef.current = requestAnimationFrame(checkAttraction)
    }

    animationFrameRef.current = requestAnimationFrame(checkAttraction)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      mouseContext.setAttractorPosition(null)
    }
  }, [mousePosition, elementRef, attractionRadius, isActive, mouseContext])

  return {
    isAttracted: mouseContext.attractorPosition !== null,
    attractorPosition: mouseContext.attractorPosition,
  }
}
