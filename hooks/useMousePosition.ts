import { useEffect, useState } from 'react'

import type { Position } from '@/types/common'
import { throttle } from '@/utils/throttle'

// https://dev.to/holdmypotion/react-custom-cursor-no-extra-dependencies-25ki
// https://gist.github.com/eldh/54954e01b40ef6fb812e2c8ee13731dc

export default function useMousePosition(): Position {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = throttle(
      (event: MouseEvent) => {
        setMousePosition({ x: event.clientX, y: event.clientY })
      },
      16 // ~60fps
    )

    document.addEventListener('mousemove', updateMousePosition, { passive: true })
    
    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  return mousePosition
}
