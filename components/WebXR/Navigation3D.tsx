import React, { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useWebXRBreathing, useWebXRHover } from '@/hooks/useWebXRAnimation'
import { measureChunkLoad } from '@/utils/performance'
import WEBXR_ANIMATION_CONFIG from '@/utils/webxr/animationConfig'

const Text = dynamic(
  () => measureChunkLoad('Text', () => 
    import('@react-three/drei').then((mod) => ({ default: mod.Text }))
  ),
  { ssr: false }
)

interface NavItemProps {
  position: [number, number, number]
  text: string
  isActive: boolean
  onClick: () => void
}

const NavItem = ({ position, text, isActive, onClick }: NavItemProps) => {
  const [hovered, setHovered] = useState(false)
  const [hasBeenInteracted, setHasBeenInteracted] = useState(false)
  const textRef = useRef<THREE.Mesh>(null)

  // Use centralized animation hooks
  const breathing = useWebXRBreathing()
  const hover = useWebXRHover()

  // Start breathing animation on mount
  useEffect(() => {
    return breathing.startBreathing()
  }, [breathing])

  useEffect(() => {
    if (hovered || isActive) {
      hover.onHover()
      breathing.stopBreathing()
    } else if (!hovered && !isActive && !breathing.hasInteracted) {
      hover.onHoverEnd()
    }
  }, [hovered, isActive, breathing, hover])

  useFrame(() => {
    if (!textRef.current) return
    // Apply centralized animation values
    const scale = hovered || isActive ? hover.scale : breathing.scaleValue
    const rotation = breathing.rotationValue
    
    textRef.current.scale.setScalar(scale)
    textRef.current.rotation.y = rotation
    textRef.current.rotation.z = rotation * 0.5 // Subtle z-rotation
  })

  return (
    <Text
      ref={textRef}
      position={position}
      color={isActive ? '#ffffff' : hovered ? '#d1d5db' : '#9ca3af'}
      anchorX="center"
      anchorY="middle"
      fontSize={0.6}
      font="/fonts/GT-Eesti-Display-Bold-Trial.woff"
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {text}
    </Text>
  )
}

function Navigation3D() {
  const { currentView, navigateToView } = useWebXRView()
  const { navigation } = WEBXR_ANIMATION_CONFIG.spatial

  return (
    <group position={navigation.group}>
      {/* Main Navigation - More comfortable position for visionOS */}
      <group position={navigation.buttonOffset}>
        {currentView === 'home' ? (
          <NavItem
            position={[0, 0, 0]}
            text="work"
            isActive={false}
            onClick={() => navigateToView('work')}
          />
        ) : (
          <NavItem
            position={[0, 0, 0]}
            text="home"
            isActive={false}
            onClick={() => navigateToView('home')}
          />
        )}
      </group>
    </group>
  )
}

export default Navigation3D