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

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const elementCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    // Calculate distance using more efficient method
    const deltaX = mousePosition.x - elementCenter.x
    const deltaY = mousePosition.y - elementCenter.y
    const distance = Math.hypot(deltaX, deltaY)

    const isWithinRadius = distance <= attractionRadius
    const wasAttracted = mouseContext.attractorPosition !== null

    if (isWithinRadius && !wasAttracted) {
      mouseContext.setAttractorPosition(elementCenter)
      mouseContext.cursorChangeHandler('attracted')
    } else if (!isWithinRadius && wasAttracted) {
      mouseContext.setAttractorPosition(null)
      mouseContext.cursorChangeHandler('default')
    }
  }, [mousePosition, elementRef, attractionRadius, isActive, mouseContext])

  return {
    isAttracted: mouseContext.attractorPosition !== null,
    attractorPosition: mouseContext.attractorPosition,
  }
}
