import { useEffect, useState } from 'react'

type MousePosition = { x: number; y: number }

/**
 * Optimized mouse position hook - simplified version
 * 
 * Improvements over original useMousePosition:
 * - Eliminates 50ms throttle delay for smoother tracking
 * - Direct state updates for immediate response
 * - Passive event listeners for better performance
 */
export default function useOptimizedMousePosition(): MousePosition {
  // Initialize with center of screen to avoid starting at (0,0)
  const [mousePosition, setMousePosition] = useState<MousePosition>(() => {
    if (typeof window !== 'undefined') {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
    }
    return { x: 0, y: 0 }
  })

  useEffect(() => {
    // Direct mouse position updates - no throttling, no RAF complexity
    const updateMousePosition = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      })
    }

    // Add mouse listener with passive flag for performance
    document.addEventListener('mousemove', updateMousePosition, { passive: true })

    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  return mousePosition
}