import React, { useRef, useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

import { useSpringAnimation, useSpringScalar } from '@/hooks/useSpringAnimation'

import { measureChunkLoad } from '@/utils/performance'
import {
  SPRING_CONFIGS,
  ENTRANCE_POSITIONS,
} from '@/utils/webxr/animationConstants'

const Text = dynamic(
  () =>
    measureChunkLoad('Text', () =>
      import('@react-three/drei').then((mod) => ({ default: mod.Text })),
    ),
  { ssr: false },
)

interface WorkCardProps {
  title: string
  subTitle: string
  slug: string
  cover: string
  position: [number, number, number]
  isFullScreen?: boolean
  isCenter?: boolean
  isWIP?: boolean
  currentSection: 'hero' | 'work'
}

const WorkCard = ({
  title,
  subTitle,
  slug,
  cover,
  position,
  isFullScreen = false,
  isCenter = false,
  isWIP = false,
  currentSection,
}: WorkCardProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const texture = useLoader(THREE.TextureLoader, cover)

  // Simplified spring animation - start from bottom, animate to final position
  const cardPositionSpring = useSpringAnimation(
    [position[0], position[1] - 6, position[2]], // Start 6 units below final position
    SPRING_CONFIGS.cardPosition,
  )

  const scaleSpring = useSpringScalar(0, SPRING_CONFIGS.cardScale) // Start completely hidden
  const hoverYSpring = useSpringScalar(0, SPRING_CONFIGS.cardHover)

  useEffect(() => {
    if (currentSection === 'work') {
      // Immediate entrance animation with slight stagger
      const delay = Math.random() * 200 + 100 // Reduced delay: 100-300ms
      setTimeout(() => {
        cardPositionSpring.set(position)
        scaleSpring.set(1)
      }, delay)
    } else {
      // Reset to bottom position when not active
      cardPositionSpring.set([position[0], position[1] - 6, position[2]])
      scaleSpring.set(0)
    }
  }, [currentSection, position, cardPositionSpring, scaleSpring])

  useEffect(() => {
    if (hovered) {
      scaleSpring.set(1.05)
      hoverYSpring.set(0.1)
    } else {
      // Check if card has reached final position
      const hasReachedPosition =
        cardPositionSpring.value.distanceTo(new THREE.Vector3(...position)) <
        0.1
      scaleSpring.set(hasReachedPosition ? 1 : 0.1)
      hoverYSpring.set(0)
    }
  }, [hovered, cardPositionSpring, scaleSpring, hoverYSpring, position])

  useFrame(() => {
    if (!groupRef.current) return

    // Apply spring values to mesh
    groupRef.current.position.copy(cardPositionSpring.value)
    groupRef.current.position.y += hoverYSpring.value
    groupRef.current.scale.setScalar(scaleSpring.value)
    
    // Handle visibility
    groupRef.current.visible = scaleSpring.value > 0.01
  })

  const handleClick = () => {
    setClicked(!clicked)
    // Spring bounce effect on click
    scaleSpring.set(0.95)
    setTimeout(() => scaleSpring.set(hovered ? 1.05 : 1), 100)
    console.log('Work card clicked') // In real implementation, navigate to work detail
  }

  // Determine card size based on layout
  const cardWidth = isFullScreen ? 6 : 3
  const cardHeight = isFullScreen ? 3 : 2

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      userData={{ isWorkElement: true, originalY: position[1] }}
    >
      {/* Card Background with Image */}
      <mesh userData={{ isWorkElement: true, originalY: position[1] }}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={hovered ? 0.9 : 1}
        />
      </mesh>

      {/* Overlay for hover effect */}
      {hovered && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial color="black" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Text Content */}
      {hovered && (
        <group position={[0, 0, 0.02]}>
          {/* Subtitle */}
          <Text
            position={[0, cardHeight * 0.15, 0]}
            color="#d1d5db"
            anchorX="center"
            anchorY="middle"
            fontSize={0.3}
            font="fonts/GT-Eesti-Display-Bold-Trial.woff"
          >
            {subTitle}
          </Text>

          {/* Title */}
          <Text
            position={[0, -cardHeight * 0.15, 0]}
            color="white"
            anchorX="center"
            anchorY="middle"
            fontSize={isCenter ? 0.8 : 0.6}
            font="fonts/GT-Eesti-Display-Bold-Trial.woff"
          >
            {title}
          </Text>

          {/* WIP Indicator */}
          {isWIP && (
            <Text
              position={[cardWidth * 0.3, cardHeight * 0.3, 0]}
              color="#ef4444"
              anchorX="center"
              anchorY="middle"
              fontSize={0.25}
              font="fonts/GT-Eesti-Display-Bold-Trial.woff"
            >
              WIP
            </Text>
          )}
        </group>
      )}

      {/* Interactive glow effect */}
      {hovered && (
        <pointLight
          position={[0, 0, 1]}
          intensity={0.5}
          color="#60a5fa"
          distance={5}
          decay={2}
        />
      )}
    </group>
  )
}

export default WorkCard
