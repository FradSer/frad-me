import { useEffect, useState, useRef } from 'react'

type MousePosition = { x: number; y: number }

// https://dev.to/holdmypotion/react-custom-cursor-no-extra-dependencies-25ki
// https://gist.github.com/eldh/54954e01b40ef6fb812e2c8ee13731dc

export default function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  })
  const throttleRef = useRef<number | null>(null)

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      if (throttleRef.current) return
      
      throttleRef.current = window.setTimeout(() => {
        setMousePosition({ x: event.clientX, y: event.clientY })
        throttleRef.current = null
      }, 16) // ~60fps
    }

    document.addEventListener('mousemove', updateMousePosition, { passive: true })
    
    return () => {
      document.removeEventListener('mousemove', updateMousePosition)
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [])

  return mousePosition
}
