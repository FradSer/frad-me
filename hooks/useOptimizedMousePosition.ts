import { useEffect, useState, useRef } from 'react'
import RAFManager from '@/utils/animation/RAFManager'

type MousePosition = { x: number; y: number }

/**
 * Optimized mouse position hook using centralized RAF
 * 
 * Improvements over original useMousePosition:
 * - Uses centralized RAF instead of throttle for better performance
 * - Eliminates 50ms throttle delay for smoother tracking
 * - Single mousemove listener for entire app
 * - Batched position updates synchronized with frame rate
 */
export default function useOptimizedMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const rafManager = RAFManager.getInstance()
  const currentPosition = useRef<MousePosition>({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)

  useEffect(() => {
    // Single mousemove listener that just stores the latest position
    const updateMousePosition = (event: MouseEvent) => {
      currentPosition.current = {
        x: event.clientX,
        y: event.clientY,
      }
      hasMovedRef.current = true
    }

    // RAF callback that updates state if mouse has moved
    const rafCallback = () => {
      if (hasMovedRef.current) {
        setMousePosition({ ...currentPosition.current })
        hasMovedRef.current = false
      }
    }

    // Subscribe to RAF with high priority for mouse tracking
    const unsubscribeRAF = rafManager.subscribe('mouse-position', rafCallback, 100)
    
    // Add mouse listener
    document.addEventListener('mousemove', updateMousePosition, { passive: true })

    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
      unsubscribeRAF()
    }
  }, [rafManager])

  return mousePosition
}