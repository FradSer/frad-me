import { useEffect, useState } from 'react'

type PointerType = 'fine' | 'coarse' | 'none'

/**
 * Hook to detect the primary pointer type using CSS media queries
 * - fine: Mouse, trackpad, stylus (precise pointing)
 * - coarse: Touch screen, TV remote (less precise)
 * - none: No pointing device
 */
export default function usePointerType(): PointerType {
  const [pointerType, setPointerType] = useState<PointerType>('fine')

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return

    const checkPointerType = () => {
      if (window.matchMedia('(pointer: fine)').matches) {
        setPointerType('fine')
      } else if (window.matchMedia('(pointer: coarse)').matches) {
        setPointerType('coarse')
      } else {
        setPointerType('none')
      }
    }

    // Initial check
    checkPointerType()

    // Create media query listeners
    const fineQuery = window.matchMedia('(pointer: fine)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')

    // Add listeners for dynamic changes
    fineQuery.addEventListener('change', checkPointerType)
    coarseQuery.addEventListener('change', checkPointerType)

    // Cleanup
    return () => {
      fineQuery.removeEventListener('change', checkPointerType)
      coarseQuery.removeEventListener('change', checkPointerType)
    }
  }, [])

  return pointerType
}