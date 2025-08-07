import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { workCardPositions } from '@/utils/webxr/animationHelpers'

// Navigation button position (from Navigation3D component)
const NAVIGATION_POSITION = [4, 4, 0] as [number, number, number]

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
  const [hasAnimated, setHasAnimated] = useState(false)
  
  // Simple texture loading
  const coverTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load(work.cover)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }, [work.cover])

  // Initialize position at navigation button when first becoming visible
  useEffect(() => {
    if (visible && !hasAnimated && groupRef.current) {
      groupRef.current.position.set(...NAVIGATION_POSITION)
      groupRef.current.scale.setScalar(0.1)
      setHasAnimated(true)
    }
  }, [visible, hasAnimated])

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (visible) {
        // Animate from navigation button to final position
        const targetX = position[0]
        const targetY = hovered 
          ? position[1] + workCardPositions.hover.y
          : position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1
        const targetZ = hovered 
          ? position[2] + workCardPositions.hover.z
          : position[2]
        
        const targetScale = hovered ? 1.1 : 1
        const targetOpacity = 1
        
        // Spring-like animation with staggered delay
        const animationSpeed = 3 + index * 0.5 // Stagger animation
        const positionLerpSpeed = delta * animationSpeed
        const scaleLerpSpeed = delta * (animationSpeed + 2)
        
        // Smooth interpolation using lerp
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, positionLerpSpeed)
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, positionLerpSpeed)
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, positionLerpSpeed)
        
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, scaleLerpSpeed))
        
        // Handle opacity for all materials
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if ('opacity' in material) {
                  material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * 8)
                }
              })
            } else if ('opacity' in child.material) {
              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, delta * 8)
            }
          }
        })
      } else {
        // Animate back to navigation button position when hiding
        const targetOpacity = 0
        const targetScale = 0.1
        
        // Return to navigation position
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, NAVIGATION_POSITION[0], delta * 5)
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, NAVIGATION_POSITION[1], delta * 5)
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, NAVIGATION_POSITION[2], delta * 5)
        
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8))
        
        // Fade out materials
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => {
                if ('opacity' in material) {
                  material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * 10)
                }
              })
            } else if ('opacity' in child.material) {
              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, delta * 10)
            }
          }
        })
        
        // Reset hasAnimated when fully hidden to allow re-animation
        if (groupRef.current.scale.x < 0.15) {
          setHasAnimated(false)
        }
      }
      
      // Subtle rotation when hovered
      if (hovered) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.1, delta * 5)
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 5)
      }
    }
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
        />
      </mesh>

      {/* Work title */}
      <group position={[0, -1.5, 0.1]}>
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
      </group>

      {/* Work subtitle */}
      <group position={[0, -2.1, 0.1]}>
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
      </group>

      {/* WIP Badge */}
      {work.isWIP && (
        <group position={[1.3, 0.8, 0.1]}>
          <Html transform occlude>
            <div className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black shadow-lg">
              WIP
            </div>
          </Html>
        </group>
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
    </group>
  )
}

export default WorkCard3D