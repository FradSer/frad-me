import { useEffect, useRef, useCallback } from 'react'
import useMouseContext from './useMouseContext'
import useOptimizedMousePosition from './useOptimizedMousePosition'
import RAFManager from '@/utils/animation/RAFManager'

interface UsePhysicalAttractionProps {
  elementRef: React.RefObject<HTMLElement>
  attractionRadius?: number
  isActive?: boolean
}

interface AttractionResult {
  isAttracted: boolean
  attractorPosition: { x: number; y: number } | null
  distance: number | null
}

/**
 * Optimized physical attraction hook
 * 
 * Improvements over original implementation:
 * - Uses centralized RAF manager instead of individual RAF loops
 * - Batched DOM measurements to avoid layout thrashing  
 * - Optimized distance calculations with early returns
 * - Better memory management with cleanup
 */
export default function usePhysicalAttraction({
  elementRef,
  attractionRadius = 100,
  isActive = true,
}: UsePhysicalAttractionProps): AttractionResult {
  const mouseContext = useMouseContext()
  const mousePosition = useOptimizedMousePosition()
  const rafManager = RAFManager.getInstance()
  const lastCheckRef = useRef<number>(0)
  const resultRef = useRef<AttractionResult>({
    isAttracted: false,
    attractorPosition: null,
    distance: null,
  })

  // Optimized distance calculation with early returns
  const calculateDistance = useCallback((
    mouseX: number,
    mouseY: number,
    elementX: number,
    elementY: number
  ): number => {
    const dx = mouseX - elementX
    const dy = mouseY - elementY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Memoized attraction check function
  const checkAttraction = useCallback((timestamp: DOMHighResTimeStamp) => {
    // Skip if not active or element not available
    if (!isActive || !elementRef.current) return

    // Skip frame if we've checked recently (performance optimization)
    if (timestamp - lastCheckRef.current < 16) return // ~60fps
    lastCheckRef.current = timestamp

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    const elementCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    const distance = calculateDistance(
      mousePosition.x,
      mousePosition.y,
      elementCenter.x,
      elementCenter.y
    )

    const wasAttracted = resultRef.current.isAttracted
    const isCurrentlyAttracted = distance <= attractionRadius

    // Only update context if attraction state changed (avoid unnecessary re-renders)
    if (isCurrentlyAttracted !== wasAttracted) {
      if (isCurrentlyAttracted) {
        mouseContext.setAttractorPosition(elementCenter)
        mouseContext.cursorChangeHandler('attracted')
      } else {
        mouseContext.setAttractorPosition(null)
        mouseContext.cursorChangeHandler('default')
      }
    }

    // Update result
    resultRef.current = {
      isAttracted: isCurrentlyAttracted,
      attractorPosition: isCurrentlyAttracted ? elementCenter : null,
      distance,
    }
  }, [
    isActive,
    elementRef,
    attractionRadius,
    mousePosition.x,
    mousePosition.y,
    mouseContext,
    calculateDistance,
  ])

  useEffect(() => {
    if (!isActive || !elementRef.current) return

    // Subscribe to RAF with medium priority for attraction calculations
    const rafId = `attraction-${elementRef.current.id || Math.random()}`
    const unsubscribeRAF = rafManager.subscribe(rafId, checkAttraction, 50)

    return () => {
      // Cleanup: reset mouse context and unsubscribe from RAF
      unsubscribeRAF()
      mouseContext.setAttractorPosition(null)
      mouseContext.cursorChangeHandler('default')
      
      // Reset result
      resultRef.current = {
        isAttracted: false,
        attractorPosition: null,
        distance: null,
      }
    }
  }, [isActive, rafManager, checkAttraction, mouseContext])

  return resultRef.current
}