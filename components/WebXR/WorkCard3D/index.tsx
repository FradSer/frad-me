import React, { useState, useRef, Suspense, useMemo } from 'react'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { WORK_CARD_POSITIONS } from '@/utils/webxr/animationConstants'
import { useCardAnimation } from '@/hooks/useCardAnimation'

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

  if (!visible) return null

  return (
    <group ref={groupRef} position={position}>
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
        renderOrder={hovered ? 1001 : 1} // Higher than background when hovered
      >
        <planeGeometry args={WORK_CARD_POSITIONS.cardGeometry} />
        <meshStandardMaterial
          map={coverTexture}
          transparent
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
            renderOrder={hovered ? 1002 : 2} // Ensure text is above background
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
            renderOrder={hovered ? 1002 : 2} // Ensure text is above background
          >
            {work.subTitle}
          </Text>
        </Suspense>
      </group>

      {/* WIP Badge */}
      {work.isWIP && (
        <group position={[WORK_CARD_POSITIONS.wipBadgeGroup[0], WORK_CARD_POSITIONS.wipBadgeGroup[1], 0.2]}>
          <Html transform occlude>
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
          renderOrder={1000} // Below card image and text, but above other cards
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