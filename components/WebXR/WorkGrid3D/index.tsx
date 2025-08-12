import React, { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useWebXRWorkGrid } from '@/hooks/useWebXRAnimation'
import { calculateCardPosition } from '@/utils/webxr/workGridUtils'
import { measureChunkLoad } from '@/utils/performance'
import WEBXR_ANIMATION_CONFIG from '@/utils/webxr/animationConfig'
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
  
  // Use centralized work grid animation
  const workGridAnim = useWebXRWorkGrid(currentView)

  useFrame(() => {
    if (!groupRef.current) return

    // Apply centralized work grid animation values
    const basePosition = WEBXR_ANIMATION_CONFIG.spatial.entrance.workDefault
    groupRef.current.position.set(
      basePosition[0], 
      basePosition[1] + workGridAnim.positionY, 
      basePosition[2]
    )

    // Apply centralized scale animation
    groupRef.current.scale.setScalar(workGridAnim.scale)

    // Handle visibility using centralized threshold
    groupRef.current.visible = !workGridAnim.shouldHide
    
    // Apply opacity using optimized utility
    if (groupRef.current.visible) {
      applyOpacityToObject(groupRef.current, workGridAnim.opacity)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Enhanced lighting for work section */}
      <ambientLight intensity={WEBXR_ANIMATION_CONFIG.effects.lighting.ambient} />
      <directionalLight 
        position={WEBXR_ANIMATION_CONFIG.spatial.workGrid.directionalLight} 
        intensity={WEBXR_ANIMATION_CONFIG.effects.lighting.directional} 
      />
      <pointLight 
        position={WEBXR_ANIMATION_CONFIG.spatial.workGrid.pointLight} 
        intensity={WEBXR_ANIMATION_CONFIG.effects.lighting.point} 
        color="#60a5fa" 
      />


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