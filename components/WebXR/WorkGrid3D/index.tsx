import React, { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useSpringScalar } from '@/hooks/useSpringAnimation'
import { calculateCardPosition } from '@/utils/webxr/workGridUtils'
import { measureChunkLoad } from '@/utils/performance'
import { SPRING_CONFIGS, ENTRANCE_POSITIONS } from '@/utils/webxr/animationConstants'
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

const MAX_DISPLAY_WORKS = 5

interface WorkGrid3DProps {
  visible?: boolean
}

const WorkTitle = ({ position, currentSection }: { position: [number, number, number], currentSection: string }) => {
  const textRef = useRef<THREE.Mesh>(null)
  const opacitySpring = useSpringScalar(0, SPRING_CONFIGS.workOpacity)

  useEffect(() => {
    if (currentSection === 'work') {
      opacitySpring.set(1)
    } else {
      opacitySpring.set(0)
    }
  }, [currentSection, opacitySpring])

  useFrame(() => {
    if (!textRef.current) return
    opacitySpring.update()
    
    if (textRef.current.material) {
      const material = textRef.current.material as THREE.MeshBasicMaterial
      material.opacity = opacitySpring.value
      material.transparent = true
    }
  })

  return (
    <Text
      ref={textRef}
      position={position}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      fontSize={1.2}
    >
      Selected Work
    </Text>
  )
}

const WorkGrid3D: React.FC<WorkGrid3DProps> = ({ visible = true }) => {
  const { currentView } = useWebXRView()
  const groupRef = useRef<THREE.Group>(null)
  
  // Simplified visibility control - no position animation at container level
  const opacitySpring = useSpringScalar(0, SPRING_CONFIGS.workOpacity)

  useEffect(() => {
    if (currentView === 'work') {
      // Immediately show work section when active
      opacitySpring.set(1)
    } else {
      // Hide work section when not active  
      opacitySpring.set(0)
    }
  }, [currentView, opacitySpring])

  useFrame(() => {
    if (!groupRef.current) return
    opacitySpring.update()

    // Fixed position at main content layer
    groupRef.current.position.set(...ENTRANCE_POSITIONS.workDefault)

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
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, 2]} intensity={0.6} color="#60a5fa" />

      {/* Work Title */}
      <WorkTitle position={[0, 5, 0]} currentSection={currentView} />

      {/* Work Cards */}
      {workLinks.slice(0, MAX_DISPLAY_WORKS).map((work, index) => {
        const position = calculateCardPosition(
          index + 1,
          work.isFullScreen || false,
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

      {/* Navigation hint */}
      <Html position={[0, -6, 0]} transform occlude distanceFactor={15}>
        <div className="text-center text-white opacity-75">
          <p className="text-sm">Point and click to explore work details</p>
          <p className="text-xs mt-2">Use controllers to navigate in VR</p>
        </div>
      </Html>
    </group>
  )
}

export default WorkGrid3D