import React, { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { measureChunkLoad } from '@/utils/performance'
import workLinks from '@/content/workLinks'

const Text = dynamic(
  () => measureChunkLoad('Text', () => import('@react-three/drei').then(mod => ({ default: mod.Text }))),
  { ssr: false }
)

const Html = dynamic(
  () => measureChunkLoad('Html', () => import('@react-three/drei').then(mod => ({ default: mod.Html }))),
  { ssr: false }
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
}

interface AnimatedTitleProps {
  position: [number, number, number]
}

const MAX_DISPLAY_WORKS = 5

// Custom hook for work card interactions
const useWorkCardAnimation = () => {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const targetScaleVector = useRef(new THREE.Vector3(1, 1, 1))

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth hover animation
      const targetScale = hovered ? 1.05 : 1
      targetScaleVector.current.setScalar(targetScale)
      meshRef.current.scale.lerp(targetScaleVector.current, delta * 5)

      // Subtle floating animation
      meshRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.001
    }
  })

  const handlers = {
    onClick: () => {
      setClicked(!clicked)
      console.log('Work card clicked') // In real implementation, navigate to work detail
    },
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false)
  }

  return { meshRef, hovered, clicked, handlers }
}

// Work title with scroll-based animation (simulated in 3D)
const WorkTitle = ({ position }: AnimatedTitleProps) => {
  const textRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (textRef.current) {
      // Simulate scroll-based scaling and positioning
      const time = Date.now() * 0.0005
      const scale = 1 + Math.sin(time) * 0.1
      textRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={textRef} position={position}>
      <Text
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={3}
        font="fonts/GT-Eesti-Display-Bold-Trial.woff"
        letterSpacing={0.1}
      >
        work
      </Text>
    </group>
  )
}

// Individual work card component
const WorkCard = ({ 
  title, 
  subTitle, 
  slug, 
  cover, 
  position, 
  isFullScreen = false, 
  isCenter = false, 
  isWIP = false 
}: WorkCardProps) => {
  const { meshRef, hovered, handlers } = useWorkCardAnimation()
  const texture = useLoader(THREE.TextureLoader, cover)

  // Determine card size based on layout
  const cardWidth = isFullScreen ? 6 : 3
  const cardHeight = isFullScreen ? 3 : 2

  return (
    <group ref={meshRef} position={position} {...handlers}>
      {/* Card Background with Image */}
      <mesh>
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
          <meshStandardMaterial 
            color="black"
            transparent
            opacity={0.3}
          />
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

// Grid layout calculation for 3D space
const calculateCardPosition = (index: number, isFullScreen: boolean): [number, number, number] => {
  const baseX = -4
  const baseY = 2
  const spacingX = 4
  const spacingY = 3

  if (index === 0) {
    // Title position
    return [0, 5, 0]
  }

  const workIndex = index - 1
  if (isFullScreen) {
    return [0, baseY - workIndex * spacingY, 0]
  } else {
    const col = workIndex % 2
    const row = Math.floor(workIndex / 2)
    return [baseX + col * spacingX, baseY - row * spacingY, 0]
  }
}

function WebXRWork() {
  return (
    <group position={[0, -8, -5]}>
      {/* Enhanced lighting for work section */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, 2]} intensity={0.6} color="#60a5fa" />

      {/* Work Title */}
      <WorkTitle position={[0, 5, 0]} />

      {/* Work Cards */}
      {workLinks.slice(0, MAX_DISPLAY_WORKS).map((work, index) => (
        <WorkCard
          key={work.slug}
          title={work.title}
          subTitle={work.subTitle}
          slug={work.slug}
          cover={work.cover}
          position={calculateCardPosition(index + 1, work.isFullScreen || false)}
          isFullScreen={work.isFullScreen}
          isCenter={work.isCenter}
          isWIP={work.isWIP}
        />
      ))}

      {/* Navigation hint */}
      <Html
        position={[0, -6, 0]}
        transform
        occlude
        distanceFactor={15}
      >
        <div className="text-center text-white opacity-75">
          <p className="text-sm">Point and click to explore work details</p>
          <p className="text-xs mt-2">Use controllers to navigate in VR</p>
        </div>
      </Html>
    </group>
  )
}

export default WebXRWork