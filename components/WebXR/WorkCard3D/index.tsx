import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { WORK_CARD_POSITIONS } from '@/utils/webxr/animationConstants'
import { useCardAnimation } from '@/hooks/useCardAnimation'
import { forceInitializeTransparency } from '@/utils/webxr/materialUtils'

interface WorkLink {
  title: string
  subTitle: string
  slug: string
  cover: string
  isCenter?: boolean
  isFullScreen?: boolean
  isWIP?: boolean
}

interface WorkCard3DProps {
  work: WorkLink
  position: [number, number, number]
  index: number
  visible?: boolean
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}

const WorkCard3D: React.FC<WorkCard3DProps> = ({
  work,
  position,
  index,
  visible = true,
  onHover,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  // Simple texture loading
  const coverTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(work.cover)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }, [work.cover])

  // Force initialize transparency immediately on mount for WebXR best practices
  useEffect(() => {
    if (groupRef.current) {
      forceInitializeTransparency(groupRef.current)
    }
  }, [])

  // Use simplified animation hook
  useCardAnimation({
    groupRef,
    visible,
    hovered,
    position,
    index
  })

  const handlePointerOver = () => {
    setHovered(true)
    onHover?.(true)
  }

  const handlePointerOut = () => {
    setHovered(false)
    onHover?.(false)
  }

  const handleClick = () => {
    onClick?.()
    if (typeof window !== 'undefined') {
      window.location.href = `/works/${work.slug}`
    }
  }

  // Remove early return - cards should always render but with opacity 0 when not visible
  // This allows for proper WebXR transparency animation from navigation position

  return (
    <group 
      ref={groupRef} 
      position={position}
      renderOrder={hovered ? 9999 : 0} // Entire card on top when hovered
    >
      {/* Invisible hover detection area covering entire card including text */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        position={[0, -1, -0.2]} // Positioned to cover card + text area, behind all other elements
      >
        <planeGeometry args={[5.5, 5]} /> {/* Larger area covering card + text */}
        <meshBasicMaterial 
          transparent 
          opacity={0} 
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
      
      {/* Card background/cover */}
      <mesh 
        ref={meshRef}
      >
        <planeGeometry args={WORK_CARD_POSITIONS.cardGeometry} />
        <meshStandardMaterial
          map={coverTexture}
          transparent
          opacity={0} // Start with complete transparency for WebXR best practices
          depthWrite={false} // WebXR best practice: disable depth write for transparent materials
          side={THREE.DoubleSide} // Ensure both sides are visible
          depthTest={!hovered} // Disable depth test when hovered to ensure it renders on top
        />
      </mesh>

      {/* Work title */}
      <group position={WORK_CARD_POSITIONS.titleGroup}>
        <Suspense fallback={null}>
          <Text
            color="white"
            anchorX="center"
            anchorY="top"
            fontSize={0.4}
            fontWeight="bold"
            maxWidth={4}
            lineHeight={1.2}
            font="/fonts/GT-Eesti-Display-Bold-Trial.woff"
          >
            {work.title}
          </Text>
        </Suspense>
      </group>

      {/* Work subtitle */}
      <group position={WORK_CARD_POSITIONS.descriptionGroup}>
        <Suspense fallback={null}>
          <Text
            color="gray"
            anchorX="center"
            anchorY="top"
            fontSize={0.25}
            maxWidth={4}
            lineHeight={1.2}
            font="/fonts/GT-Eesti-Display-Regular-Trial.woff"
          >
            {work.subTitle}
          </Text>
        </Suspense>
      </group>

      {/* WIP Badge */}
      {work.isWIP && (
        <group position={[WORK_CARD_POSITIONS.wipBadgeGroup[0], WORK_CARD_POSITIONS.wipBadgeGroup[1], 0.2]}>
          <Html transform>
            <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-lg">
              WIP
            </div>
          </Html>
        </group>
      )}

      {/* Interactive glow effect when hovered - adjusted for larger cards */}
      {hovered && (
        <mesh 
          position={WORK_CARD_POSITIONS.wipBadgeBackground}
        >
          <planeGeometry args={[4.8, 3.3]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={0.2}
            depthTest={false} // Disable depth test to ensure it renders on top
          />
        </mesh>
      )}
    </group>
  )
}

export default WorkCard3D