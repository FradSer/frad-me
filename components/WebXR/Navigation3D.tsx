import React, { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useSpringScalar } from '@/hooks/useSpringAnimation'
import { measureChunkLoad } from '@/utils/performance'
import { SPRING_CONFIGS } from '@/utils/webxr/animationConstants'

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

  const scaleSpring = useSpringScalar(1, SPRING_CONFIGS.navScale)

  // Breathing effect when never interacted
  useEffect(() => {
    if (!hasBeenInteracted) {
      const breathingAnimation = setInterval(() => {
        scaleSpring.set(1.05)
        setTimeout(() => scaleSpring.set(1), 800)
      }, 2000)
      
      return () => clearInterval(breathingAnimation)
    }
  }, [hasBeenInteracted, scaleSpring])

  useEffect(() => {
    if (hovered || isActive) {
      scaleSpring.set(1.1)
    } else if (hasBeenInteracted) {
      scaleSpring.set(1)
    }
  }, [hovered, isActive, hasBeenInteracted, scaleSpring])

  useFrame(() => {
    if (!textRef.current) return
    scaleSpring.update()
    textRef.current.scale.setScalar(scaleSpring.value)
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
    <group position={[0, 0, -2]}>
      {/* Main Navigation - Top Right */}
      <group position={[4, 4, 0]}>
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