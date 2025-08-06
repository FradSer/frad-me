import React, { useRef, useMemo, useCallback } from 'react'

import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Quality = 'high' | 'medium' | 'low'
type GeometryType = 'box' | 'sphere' | 'cone'

// Quality-based configurations
const QUALITY_CONFIGS = {
  high: { 
    segments: 32, 
    shadows: true, 
    distortion: true, 
    particles: 20,
    rotationIntensity: 0.5,
    floatingRange: [-0.1, 0.1] as [number, number]
  },
  medium: { 
    segments: 24, 
    shadows: false, 
    distortion: true, 
    particles: 10,
    rotationIntensity: 0.3,
    floatingRange: [-0.075, 0.075] as [number, number]
  },
  low: { 
    segments: 16, 
    shadows: false, 
    distortion: false, 
    particles: 0,
    rotationIntensity: 0.2,
    floatingRange: [-0.05, 0.05] as [number, number]
  }
} as const

interface AnimatedShapeProps {
  geometry: GeometryType
  position: [number, number, number]
  color: string
  delay: number
  scale?: number
  speed?: number
  floatIntensity?: number
  distortionIntensity?: number
  quality: Quality
}

interface AnimatedShapesProps {
  quality: Quality
}

interface ShapeConfig {
  geometry: GeometryType
  position: [number, number, number]
  color: string
  delay: number
  scale: number
  speed: number
  floatIntensity?: number
  distortionIntensity?: number
}

interface ParticleData {
  position: [number, number, number]
  velocity: [number, number, number]
  scale: number
  rotationSpeed: number
}

// Predefined shape configurations matching Hero component geometry
const HERO_SHAPE_CONFIGS: ShapeConfig[] = [
  // Triangle - positioned near "Frad LEE" text like in Hero component
  { geometry: 'cone', position: [-6, 4, -2], color: '#ffffff', delay: 0, scale: 1.2, speed: 1.0 },
  // Rectangle - positioned near "advancement" text 
  { geometry: 'box', position: [4, 1.5, -1], color: '#ffffff', delay: 0.5, scale: [2, 0.2, 0.5] as any, speed: 0.8 },
  // Dot Circle - positioned near "startup" text
  { geometry: 'sphere', position: [3, -2.5, -1], color: '#ffffff', delay: 1.0, scale: 0.8, speed: 1.2 }
]

const RING_POSITIONS: [number, number, number][] = [
  [-3, 0, -5],
  [6, -2, -8]
]

// Reusable geometry factory to eliminate duplication
const createGeometry = (type: GeometryType, quality: Quality) => {
  const segments = QUALITY_CONFIGS[quality].segments
  
  switch (type) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />
    case 'sphere':
      return <sphereGeometry args={[0.6, segments, segments]} />
    case 'cone':
      return <coneGeometry args={[0.6, 1, segments]} />
  }
}

// Reusable material factory
const createMaterial = (color: string, speed: number, distortionIntensity: number, quality: Quality) => {
  const config = QUALITY_CONFIGS[quality]
  
  if (!config.distortion) {
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        roughness={0.4}
        metalness={0.6}
      />
    )
  }
  
  return (
    <MeshDistortMaterial
      color={color}
      speed={speed}
      distort={distortionIntensity}
      radius={1}
      roughness={0.3}
      metalness={0.7}
    />
  )
}

// Optimized animation hook to reduce calculations
const useShapeAnimation = (delay: number, speed: number, position: [number, number, number], floatIntensity: number) => {
  return useCallback((state: any, meshRef: React.RefObject<THREE.Mesh>) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime + delay
    const rotationSpeed = speed * 0.5
    const bobSpeed = speed * 2

    const mesh = meshRef.current
    mesh.rotation.x = Math.sin(time * rotationSpeed) * 0.3
    mesh.rotation.y = Math.cos(time * rotationSpeed) * 0.3
    mesh.rotation.z = Math.sin(time * rotationSpeed * 0.5) * 0.1
    mesh.position.y = position[1] + Math.sin(time * bobSpeed) * floatIntensity * 0.5
  }, [delay, speed, position, floatIntensity])
}

const AnimatedShape: React.FC<AnimatedShapeProps> = ({
  geometry,
  position,
  color,
  delay,
  scale = 1,
  speed = 1,
  floatIntensity = 0.5,
  distortionIntensity = 0.2,
  quality
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const config = QUALITY_CONFIGS[quality]
  const animateShape = useShapeAnimation(delay, speed, position, floatIntensity)

  useFrame((state) => animateShape(state, meshRef))

  return (
    <Float
      speed={speed}
      rotationIntensity={config.rotationIntensity}
      floatIntensity={floatIntensity}
      floatingRange={config.floatingRange}
    >
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        castShadow={quality === 'high'}
        receiveShadow={quality === 'high'}
      >
        {createGeometry(geometry, quality)}
        {createMaterial(color, speed, distortionIntensity, quality)}
      </mesh>
    </Float>
  )
}

const PulsingRing: React.FC<{ position: [number, number, number]; quality: Quality }> = ({
  position,
  quality
}) => {
  const ringRef = useRef<THREE.Mesh>(null)
  const config = QUALITY_CONFIGS[quality]

  useFrame((state) => {
    if (!ringRef.current) return

    const time = state.clock.elapsedTime
    const pulse = Math.sin(time * 2) * 0.3 + 1

    ringRef.current.scale.setScalar(pulse)
    ringRef.current.rotation.z = time * 0.5
    ;(ringRef.current.material as THREE.MeshStandardMaterial).opacity = 
      (Math.sin(time * 3) * 0.3 + 0.7) * 0.6
  })

  return (
    <mesh
      ref={ringRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.8, 1.2, config.segments]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#7c3aed"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

const FloatingParticles: React.FC<{ quality: Quality }> = ({ quality }) => {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const config = QUALITY_CONFIGS[quality]
  
  // Pre-create temp object to avoid allocation in render loop
  const tempObject = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const particleArray: ParticleData[] = []

    for (let i = 0; i < config.particles; i++) {
      particleArray.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ],
        scale: Math.random() * 0.3 + 0.1,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      })
    }

    return particleArray
  }, [config.particles])

  useFrame(() => {
    if (!particlesRef.current) return

    particles.forEach((particle, i) => {
      // Update positions with boundary bouncing
      particle.position.forEach((pos, axis) => {
        particle.position[axis] += particle.velocity[axis]
        const boundary = axis === 1 ? 10 : 15 // Y has smaller boundary
        if (Math.abs(particle.position[axis]) > boundary) {
          particle.velocity[axis] *= -1
        }
      })

      // Update matrix using pre-created temp object
      tempObject.position.set(...particle.position)
      tempObject.rotation.x += particle.rotationSpeed
      tempObject.rotation.y += particle.rotationSpeed
      tempObject.rotation.z += particle.rotationSpeed
      tempObject.scale.setScalar(particle.scale)
      tempObject.updateMatrix()

      particlesRef.current!.setMatrixAt(i, tempObject.matrix)
    })

    particlesRef.current.instanceMatrix.needsUpdate = true
  })

  if (quality === 'low') return null

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, config.particles]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#d97706"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}

const AnimatedShapes: React.FC<AnimatedShapesProps> = ({ quality }) => {
  const shapesToRender = useMemo(() => {
    return HERO_SHAPE_CONFIGS
  }, [])

  return (
    <group>
      {shapesToRender.map((config, index) => (
        <AnimatedShape
          key={`hero-shape-${index}`}
          {...config}
          quality={quality}
        />
      ))}

      {quality !== 'low' && 
        RING_POSITIONS.map((position, index) => (
          <PulsingRing 
            key={`ring-${index}`}
            position={position} 
            quality={quality} 
          />
        ))
      }

      <FloatingParticles quality={quality} />
    </group>
  )
}

export default AnimatedShapes