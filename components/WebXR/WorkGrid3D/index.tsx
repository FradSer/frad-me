import React, { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp'
import { calculateCardPosition } from '@/utils/webxr/workGridUtils'
import { measureChunkLoad } from '@/utils/performance'
import { SPRING_CONFIGS, ENTRANCE_POSITIONS, WORK_GRID_POSITIONS } from '@/utils/webxr/animationConstants'
import { applyOpacityToObject } from '@/utils/webxr/materialUtils'
import WorkCard3D from '../WorkCard3D'
import workLinks from '@/content/workLinks'

const Html = dynamic(
  () => measureChunkLoad('Html', () => 
    import('@react-three/drei').then((mod) => ({ default: mod.Html }))
  ),
  { ssr: false }
)

const Text = dynamic(
  () => measureChunkLoad('Text', () => 
    import('@react-three/drei').then((mod) => ({ default: mod.Text }))
  ),
  { ssr: false }
)

const MAX_DISPLAY_WORKS = 5  // Display all works with 3 per row layout

interface WorkGrid3DProps {
  visible?: boolean
}


const WorkGrid3D: React.FC<WorkGrid3DProps> = ({ visible = true }) => {
  const { currentView } = useWebXRView()
  const groupRef = useRef<THREE.Group>(null)
  
  // Enhanced spring control with bouncy entrance effect
  const opacitySpring = useSimpleLerp(0, { speed: springConfigToLerpSpeed(SPRING_CONFIGS.elastic) })
  const scaleSpring = useSimpleLerp(0.8, { speed: springConfigToLerpSpeed(SPRING_CONFIGS.bouncy) })
  const positionYSpring = useSimpleLerp(-2, { speed: springConfigToLerpSpeed(SPRING_CONFIGS.elastic) })

  useEffect(() => {
    if (currentView === 'work') {
      // Enhanced entrance with spring effects
      opacitySpring.set(1)
      scaleSpring.set(1)
      positionYSpring.set(0)
    } else {
      // Enhanced exit with spring effects
      opacitySpring.set(0)
      scaleSpring.set(0.8)
      positionYSpring.set(-2)
    }
  }, [currentView, opacitySpring, scaleSpring, positionYSpring])

  useFrame(() => {
    if (!groupRef.current) return
    // Lerp values are automatically updated via useFrame in useSimpleLerp hooks

    // Apply spring-based position with Y offset for bouncy entrance
    const basePosition = ENTRANCE_POSITIONS.workDefault
    groupRef.current.position.set(
      basePosition[0], 
      basePosition[1] + positionYSpring.value, 
      basePosition[2]
    )

    // Apply spring-based scale
    groupRef.current.scale.setScalar(scaleSpring.value)

    // Handle visibility - completely hide when opacity is near 0
    const currentOpacity = opacitySpring.value
    groupRef.current.visible = currentOpacity > 0.01
    
    // Apply opacity using optimized utility
    if (groupRef.current.visible) {
      applyOpacityToObject(groupRef.current, currentOpacity)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Enhanced lighting for work section */}
      <ambientLight intensity={0.4} />
      <directionalLight position={WORK_GRID_POSITIONS.directionalLight} intensity={0.8} />
      <pointLight position={WORK_GRID_POSITIONS.pointLight} intensity={0.6} color="#60a5fa" />


      {/* Work Cards */}
      {workLinks.slice(0, MAX_DISPLAY_WORKS).map((work, index) => {
        const position = calculateCardPosition(
          index + 1,
          work.isFullScreen || false,
          workLinks.length  // Pass total number of works
        )
        return (
          <WorkCard3D
            key={work.slug}
            work={work}
            position={position}
            index={index}
            visible={currentView === 'work'}
          />
        )
      })}

    </group>
  )
}

export default WorkGrid3D