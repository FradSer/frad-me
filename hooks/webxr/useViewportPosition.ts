import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'

type PositionKey = 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft'

const POSITION_OFFSETS = {
  topRight: { x: -2, y: -1 },
  bottomRight: { x: -2, y: 1 },
  topLeft: { x: 2, y: -1 },
  bottomLeft: { x: 2, y: 1 },
} as const

export function useViewportPosition(position: PositionKey): [number, number, number] {
  const { viewport } = useThree()
  
  return useMemo(() => {
    const offset = POSITION_OFFSETS[position]
    return [
      viewport.width / 2 + offset.x,
      viewport.height / 2 + offset.y,
      0
    ] as [number, number, number]
  }, [viewport.width, viewport.height, position])
}

export default useViewportPosition