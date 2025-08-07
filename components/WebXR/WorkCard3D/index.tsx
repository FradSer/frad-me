import React, { useState, useRef, Suspense, memo, useMemo, useCallback } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { springConfigs } from '@/utils/webxr/springConfigs'
import { workCardPositions } from '@/utils/webxr/animationHelpers'

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
  const [hovered, setHovered] = useState(false)
  
  // Simple texture loading - memoization not needed for single texture
  const coverTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(work.cover)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }, [work.cover])

  // Calculate position dynamically - no need for useMemo overhead
  const targetPosition = visible 
    ? hovered 
      ? [position[0], position[1] + workCardPositions.hover.y, position[2] + workCardPositions.hover.z]
      : [position[0], position[1], position[2]]
    : [position[0], position[1] + workCardPositions.entrance.y, position[2] + workCardPositions.entrance.z]

  const { animatedPosition, scale, opacity, rotation } = useSpring({
    animatedPosition: targetPosition as [number, number, number],
    scale: visible ? (hovered ? 1.1 : 1) : 0.8,
    opacity: visible ? 1 : 0,
    rotation: hovered ? [0, 0.1, 0] : [0, 0, 0],
    config: springConfigs.cardEntrance,
    delay: visible ? index * 100 : 0,
  })

  useFrame((state) => {
    if (meshRef.current && !hovered && visible) {
      // Subtle floating animation when not hovered
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1
    }
  })

  // Simplified handlers without useCallback overhead
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
    // Navigate to work detail page
    if (typeof window !== 'undefined') {
      window.location.href = `/works/${work.slug}`
    }
  }

  if (!visible) return null

  return (
    <animated.group
      position={animatedPosition}
      scale={scale}
      rotation={rotation.to((x, y, z) => [x, y, z] as [number, number, number])}
    >
      {/* Card background/cover */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[3, 2, 1]} />
        <meshStandardMaterial
          map={coverTexture}
          transparent
          opacity={opacity.to(o => o)}
        />
      </mesh>

      {/* Work title */}
      <animated.group position={[0, -1.5, 0.1]} opacity={opacity}>
        <Suspense fallback={null}>
          <Text
            color="white"
            anchorX="center"
            anchorY="top"
            fontSize={0.3}
            fontWeight="bold"
            maxWidth={3}
            lineHeight={1.2}
            font="/fonts/GT-Eesti-Display-Bold-Trial.woff"
          >
            {work.title}
          </Text>
        </Suspense>
      </animated.group>

      {/* Work subtitle */}
      <animated.group position={[0, -2.1, 0.1]} opacity={opacity}>
        <Suspense fallback={null}>
          <Text
            color="gray"
            anchorX="center"
            anchorY="top"
            fontSize={0.2}
            maxWidth={3}
            lineHeight={1.2}
            font="/fonts/GT-Eesti-Display-Regular-Trial.woff"
          >
            {work.subTitle}
          </Text>
        </Suspense>
      </animated.group>

      {/* WIP Badge */}
      {work.isWIP && (
        <animated.group position={[1.3, 0.8, 0.1]} opacity={opacity}>
          <Html transform occlude>
            <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
              WIP
            </div>
          </Html>
        </animated.group>
      )}

      {/* Interactive glow effect when hovered */}
      {hovered && (
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[3.2, 2.2]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </animated.group>
  )
})

export default WorkCard3D