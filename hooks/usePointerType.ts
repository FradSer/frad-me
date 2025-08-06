import { useEffect, useState } from 'react'

export type PointerType = 'fine' | 'coarse' | 'none'

type UsePointerTypeResult = {
  pointerType: PointerType
  isFinePointer: boolean
  isCoarsePointer: boolean
  hasNoPointer: boolean
}

const POINTER_QUERIES = {
  fine: '(pointer: fine)',
  coarse: '(pointer: coarse)',
} as const

/**
 * Modern hook to detect pointer type with additional helper properties
 * Uses CSS media queries to determine the primary pointing device capability
 * 
 * @returns Object with pointer type and boolean helpers
 */
export default function usePointerType(): UsePointerTypeResult {
  const [pointerType, setPointerType] = useState<PointerType>('fine')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueries = {
      fine: window.matchMedia(POINTER_QUERIES.fine),
      coarse: window.matchMedia(POINTER_QUERIES.coarse),
    }

    const updatePointerType = () => {
      if (mediaQueries.fine.matches) {
        setPointerType('fine')
      } else if (mediaQueries.coarse.matches) {
        setPointerType('coarse')
      } else {
        setPointerType('none')
      }
    }

    // Initial check
    updatePointerType()

    // Add event listeners
    Object.values(mediaQueries).forEach(query => {
      query.addEventListener('change', updatePointerType)
    })

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(query => {
        query.removeEventListener('change', updatePointerType)
      })
    }
  }, [])

  return {
    pointerType,
    isFinePointer: pointerType === 'fine',
    isCoarsePointer: pointerType === 'coarse',
    hasNoPointer: pointerType === 'none',
  }
}