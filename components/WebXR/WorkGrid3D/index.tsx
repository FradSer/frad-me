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

const WorkGrid3D: React.FC<WorkGrid3DProps> = memo(({ visible = true }) => {
  const { state } = useWebXRView()
  
  const shouldShow = useMemo(() => visible && state.currentView === 'work', [visible, state.currentView])

  const { position, opacity, scale } = useSpring({
    position: shouldShow ? [0, 0, 0] : [0, -10, 0],
    opacity: shouldShow ? 1 : 0,
    scale: shouldShow ? 1 : 0.8,
    config: springConfigs.cardEntrance,
  })

  // Calculate positions for work cards in a 3D grid
  const cardPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    const cols = 3
    const spacing = 4
    const startX = -(cols - 1) * spacing / 2
    
    workLinks.forEach((_, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      
      const x = startX + col * spacing
      const y = 2 - row * 3 // Start from top and go down
      const z = 0
      
      positions.push([x, y, z])
    })
    
    return positions
  }, [])

  const handleCardClick = useCallback((work: WorkLink) => {
    // Add any additional click handling if needed
    console.log('Work card clicked:', work.title)
  }, [])

  const handleCardHover = useCallback((work: WorkLink, hovered: boolean) => {
    // Add cursor or other hover effects if needed
    if (typeof window !== 'undefined') {
      document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }
  }, [])

  if (!visible || !shouldShow) return null

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
          onHover={(hovered) => handleCardHover(work, hovered)}
          onClick={() => handleCardClick(work)}
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