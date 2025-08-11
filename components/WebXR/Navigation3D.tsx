import React, { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useSimpleLerp, springConfigToLerpSpeed } from '@/hooks/useSimpleLerp'
import { measureChunkLoad } from '@/utils/performance'
import { SPRING_CONFIGS, NAVIGATION_POSITIONS } from '@/utils/webxr/animationConstants'

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

  // Enhanced bouncy spring for navigation interactions
  const scaleSpring = useSimpleLerp(1, { speed: springConfigToLerpSpeed(SPRING_CONFIGS.bouncy) })
  const rotationSpring = useSimpleLerp(0, { speed: springConfigToLerpSpeed(SPRING_CONFIGS.elastic) })

  // Enhanced breathing effect with rotation
  useEffect(() => {
    if (!hasBeenInteracted) {
      const breathingAnimation = setInterval(() => {
        scaleSpring.set(1.08)  // Slightly more pronounced breathing
        rotationSpring.set(0.05) // Add subtle rotation
        setTimeout(() => {
          scaleSpring.set(1)
          rotationSpring.set(0)
        }, 1000)
      }, 2500)
      
      return () => clearInterval(breathingAnimation)
    }
  }, [hasBeenInteracted, scaleSpring, rotationSpring])

  useEffect(() => {
    if (hovered || isActive) {
      scaleSpring.set(1.15)  // More pronounced hover effect
      rotationSpring.set(hovered ? 0.1 : 0) // Rotation on hover
    } else if (hasBeenInteracted) {
      scaleSpring.set(1)
      rotationSpring.set(0)
    }
  }, [hovered, isActive, hasBeenInteracted, scaleSpring, rotationSpring])

  useFrame(() => {
    if (!textRef.current) return
    // Apply spring values with enhanced effects
    textRef.current.scale.setScalar(scaleSpring.value)
    textRef.current.rotation.y = rotationSpring.value
    textRef.current.rotation.z = rotationSpring.value * 0.5 // Subtle z-rotation
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
      onClick={() => {
        setHasBeenInteracted(true)
        onClick()
      }}
      onPointerOver={() => {
        setHasBeenInteracted(true)
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {text}
    </Text>
  )
}

function Navigation3D() {
  const { currentView, navigateToView } = useWebXRView()

  return (
    <group position={NAVIGATION_POSITIONS.navigationGroup}>
      {/* Main Navigation - More comfortable position for visionOS */}
      <group position={NAVIGATION_POSITIONS.navigationButton}>
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