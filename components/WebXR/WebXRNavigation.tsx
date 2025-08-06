import React, { useRef, useState } from 'react'

import dynamic from 'next/dynamic'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useSpringScalar } from '@/hooks/useSpringAnimation'

import { measureChunkLoad } from '@/utils/performance'
import { SPRING_CONFIGS } from '@/utils/webxr/animationConstants'

const Html = dynamic(
  () =>
    measureChunkLoad('Html', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Html })),
    ),
  { ssr: false },
)

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
)

interface NavigationProps {
  currentSection: 'hero' | 'work'
  onNavigate: (section: 'hero' | 'work') => void
}

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

  // Use centralized spring animation hook
  const scaleSpring = useSpringScalar(1, SPRING_CONFIGS.navScale)

  // Breathing effect when never interacted
  React.useEffect(() => {
    if (!hasBeenInteracted) {
      const breathingAnimation = setInterval(() => {
        scaleSpring.set(1.05)
        setTimeout(() => scaleSpring.set(1), 800)
      }, 2000) // Breathe every 2 seconds
      
      return () => clearInterval(breathingAnimation)
    }
  }, [hasBeenInteracted, scaleSpring])

  React.useEffect(() => {
    if (hovered || isActive) {
      scaleSpring.set(1.1)
    } else if (hasBeenInteracted) {
      scaleSpring.set(1)
    }
  }, [hovered, isActive, hasBeenInteracted, scaleSpring])

  useFrame(() => {
    if (!textRef.current) return

    // Apply spring value to mesh
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
      font="fonts/GT-Eesti-Display-Bold-Trial.woff"
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

const ExternalLinks = ({
  position,
  show,
}: {
  position: [number, number, number]
  show: boolean
}) => {
  if (!show) return null

  return (
    <Html
      position={position}
      transform
      occlude={false}
      distanceFactor={8}
      style={{ zIndex: 1000 }}
    >
      <div className="flex space-x-6 text-base">
        <a
          href="https://read.cv/fradser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-300"
        >
          resume
        </a>
        <a
          href="https://calendly.com/fradser"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-300"
        >
          calendly
        </a>
      </div>
    </Html>
  )
}

function WebXRNavigation({ currentSection, onNavigate }: NavigationProps) {
  return (
    <group position={[0, 0, -2]}>
      {/* Main Navigation - Top Right - Aligned with external links */}
      <group position={[4, 4, 0]}>
        {currentSection === 'hero' ? (
          <NavItem
            position={[0, 0, 0]}
            text="work"
            isActive={false}
            onClick={() => onNavigate('work')}
          />
        ) : (
          <NavItem
            position={[0, 0, 0]}
            text="home"
            isActive={false}
            onClick={() => onNavigate('hero')}
          />
        )}
      </group>

      {/* External Links - Bottom Right - Only show in hero section */}
      <ExternalLinks position={[4, -4, 0]} show={currentSection === 'hero'} />
    </group>
  )
}

export default WebXRNavigation
