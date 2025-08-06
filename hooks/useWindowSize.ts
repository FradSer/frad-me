import { useEffect, useState } from 'react'

import type { Size } from '@/types/common'

export default function useWindowSize(): Size {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<Size>({
    width: 500,
    height: 500,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}
