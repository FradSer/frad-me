import { useEffect, useState } from 'react'

type MousePosition = { x: number; y: number }

/**
 * Simple mouse position tracking hook
 */
export default function useOptimizedMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  }))

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    document.addEventListener('mousemove', updateMousePosition, { passive: true })
    return () => document.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return mousePosition
}