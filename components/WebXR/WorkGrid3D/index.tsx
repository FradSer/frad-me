import React, { useMemo, memo, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { springConfigs } from '@/utils/webxr/springConfigs'
import WorkCard3D from '../WorkCard3D'
import workLinks from '@/content/workLinks'

interface WorkLink {
  title: string
  subTitle: string
  slug: string
  cover: string
  isCenter?: boolean
  isFullScreen?: boolean
  isWIP?: boolean
}

interface WorkGrid3DProps {
  visible?: boolean
}

const WorkGrid3D: React.FC<WorkGrid3DProps> = ({ visible = true }) => {
  const { currentView } = useWebXRView()
  
  const shouldShow = visible && currentView === 'work'

  const { position, opacity, scale } = useVisibilityAnimation({
    visible: shouldShow,
    springConfig: 'cardEntrance',
    scaleFrom: 0.8,
    customValues: {
      position: [[0, -10, 0], [0, 0, 0]]
    }
  })

  // Simple card positions - memoization not needed for static layout
  const cardPositions: [number, number, number][] = []
  const cols = 3
  const spacing = 4
  const startX = -(cols - 1) * spacing / 2
  
  workLinks.forEach((_, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    const x = startX + col * spacing
    const y = 2 - row * 3 // Start from top and go down
    const z = 0
    
    cardPositions.push([x, y, z])
  })

  if (!shouldShow) return null

  return (
    <animated.group
      position={position.to((x, y, z) => [x, y, z] as [number, number, number])}
      scale={scale}
    >
      {/* Background plane for better visual separation */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={opacity.to(o => o * 0.3)} 
        />
      </mesh>

      {/* Work cards */}
      {workLinks.map((work, index) => (
        <WorkCard3D
          key={work.slug}
          work={work}
          position={cardPositions[index]}
          index={index}
          visible={shouldShow}
        />
      ))}

      {/* Grid title */}
      {shouldShow && (
        <animated.group position={[0, 4, 0]} opacity={opacity}>
          <mesh>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {/* We can add a title here later if needed */}
        </animated.group>
      )}
    </animated.group>
  )
})

export default WorkGrid3D