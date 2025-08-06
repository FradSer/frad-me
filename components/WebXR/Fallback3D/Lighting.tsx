import React, { useRef, useMemo } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Quality = 'high' | 'medium' | 'low'

interface LightingProps {
  quality: Quality
}

// Animation utilities to reduce duplication
const createFlickerAnimation = (baseIntensity: number, time: number) => {
  const flickerIntensity = Math.sin(time * 8) * 0.1 + Math.sin(time * 3) * 0.05
  return Math.max(0, baseIntensity + flickerIntensity * baseIntensity * 0.3)
}

const createOrbitAnimation = (
  basePosition: [number, number, number],
  time: number,
  radius = 2,
  speed = 0.5,
) => ({
  x: basePosition[0] + Math.sin(time * speed) * radius,
  z: basePosition[2] + Math.cos(time * speed) * radius,
})

const createPulseAnimation = (
  baseValue: number,
  time: number,
  frequency = 2,
  amplitude = 0.2,
) => baseValue * (Math.sin(time * frequency) * amplitude + 1)

// Quality-based configuration utilities
const getQualityConfig = (quality: Quality) => ({
  shadowMapSize: quality === 'high' ? 2048 : 1024,
  castShadow: quality === 'high',
  isLowQuality: quality === 'low',
  particleCount: quality === 'high' ? 20 : quality === 'medium' ? 10 : 0,
  intensityMultiplier:
    quality === 'low' ? 0.6 : quality === 'medium' ? 0.8 : 1.0,
})

const getShadowProps = (quality: Quality, size?: number) => {
  const config = getQualityConfig(quality)
  const shadowSize = size || config.shadowMapSize

  return config.castShadow
    ? {
        castShadow: true,
        'shadow-mapSize-width': shadowSize,
        'shadow-mapSize-height': shadowSize,
      }
    : { castShadow: false }
}

// Simplified animated light components
const AnimatedPointLight: React.FC<{
  position: [number, number, number]
  color: string
  intensity: number
  distance?: number
  decay?: number
  quality: Quality
  enableOrbit?: boolean
}> = ({
  position,
  color,
  intensity,
  distance = 0,
  decay = 2,
  quality,
  enableOrbit = false,
}) => {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (!lightRef.current) return

    const time = state.clock.elapsedTime
    lightRef.current.intensity = createFlickerAnimation(intensity, time)

    if (enableOrbit && quality === 'high') {
      const orbit = createOrbitAnimation(position, time)
      lightRef.current.position.x = orbit.x
      lightRef.current.position.z = orbit.z
    }
  })

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={intensity}
      distance={distance}
      decay={decay}
      shadow-camera-near={0.1}
      shadow-camera-far={100}
      {...getShadowProps(quality)}
    />
  )
}

const AnimatedSpotlight: React.FC<{
  position: [number, number, number]
  target: [number, number, number]
  color: string
  intensity: number
  angle: number
  penumbra: number
  quality: Quality
}> = ({ position, target, color, intensity, angle, penumbra, quality }) => {
  const spotlightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useFrame((state) => {
    if (!spotlightRef.current || !targetRef.current) return

    const time = state.clock.elapsedTime

    // Animated target movement
    targetRef.current.position.x = target[0] + Math.sin(time * 0.8) * 0.5
    targetRef.current.position.y = target[1] + Math.sin(time * 1.2) * 0.3

    // Pulsing intensity
    spotlightRef.current.intensity = createPulseAnimation(intensity, time)

    // Color shifting for high quality
    if (quality === 'high') {
      const colorShift = Math.sin(time) * 0.1 + 0.9
      spotlightRef.current.color.setRGB(
        colorShift,
        colorShift * 0.9,
        colorShift * 1.1,
      )
    }
  })

  if (quality === 'low') return null

  return (
    <group>
      <object3D ref={targetRef} position={target} />
      <spotLight
        ref={spotlightRef}
        position={position}
        target={targetRef.current || undefined}
        color={color}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        {...getShadowProps(quality, quality === 'high' ? 1024 : 512)}
      />
    </group>
  )
}

const VolumetricLight: React.FC<{
  position: [number, number, number]
  color: string
  quality: Quality
}> = ({ position, color, quality }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime
    meshRef.current.scale.setScalar(Math.sin(time * 1.5) * 0.1 + 1)
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      (Math.sin(time * 2) * 0.1 + 0.3) * 0.5
  })

  if (quality === 'low') return null

  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[2, 8, 8, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

const ParticleLights: React.FC<{ quality: Quality }> = ({ quality }) => {
  const groupRef = useRef<THREE.Group>(null)
  const config = getQualityConfig(quality)

  const particleColors = useMemo(
    () => ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'],
    [],
  )

  useFrame((state) => {
    if (!groupRef.current || config.isLowQuality) return

    const time = state.clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const light = child as THREE.PointLight
      const offset = i * 0.5

      light.position.set(
        Math.sin(time * 0.5 + offset) * 15,
        Math.cos(time * 0.3 + offset) * 8 + 5,
        Math.sin(time * 0.4 + offset) * 10,
      )

      light.intensity = Math.sin(time * 10 + offset) * 0.1 + 0.2
    })
  })

  if (config.isLowQuality) return null

  const lights = Array.from({ length: config.particleCount }, (_, i) => (
    <pointLight
      key={i}
      position={[
        (Math.random() - 0.5) * 30,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 20,
      ]}
      color={particleColors[i % particleColors.length]}
      intensity={0.2}
      distance={5}
      decay={2}
    />
  ))

  return <group ref={groupRef}>{lights}</group>
}

const AnimatedAmbientLight: React.FC<{ quality: Quality }> = ({ quality }) => {
  const lightRef = useRef<THREE.AmbientLight>(null)
  const baseIntensity = useMemo(
    () => (quality === 'low' ? 0.4 : quality === 'medium' ? 0.3 : 0.25),
    [quality],
  )

  useFrame((state) => {
    if (!lightRef.current) return

    const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    lightRef.current.intensity = baseIntensity + pulse
  })

  return (
    <ambientLight ref={lightRef} color="#4f46e5" intensity={baseIntensity} />
  )
}

const Lighting: React.FC<LightingProps> = ({ quality }) => {
  const config = useMemo(() => getQualityConfig(quality), [quality])

  return (
    <group>
      {/* Ambient lighting with pulse animation */}
      <AnimatedAmbientLight quality={quality} />

      {/* Main directional light with quality-based configuration */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={config.intensityMultiplier}
        color="#ffffff"
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0004}
        {...getShadowProps(quality)}
      />

      {/* Dynamic point lights with flickering and orbiting */}
      <AnimatedPointLight
        position={[-10, 5, -5]}
        color="#8b5cf6"
        intensity={quality === 'low' ? 0.3 : 0.5}
        distance={15}
        quality={quality}
        enableOrbit
      />

      <AnimatedPointLight
        position={[10, -5, 5]}
        color="#06d6a0"
        intensity={quality === 'low' ? 0.2 : 0.4}
        distance={12}
        quality={quality}
        enableOrbit
      />

      {/* Medium+ quality features */}
      {!config.isLowQuality && (
        <>
          <AnimatedSpotlight
            position={[0, 15, 0]}
            target={[0, 0, -10]}
            color="#ffd23f"
            intensity={0.8}
            angle={Math.PI / 6}
            penumbra={0.5}
            quality={quality}
          />

          <VolumetricLight
            position={[0, 12, 0]}
            color="#ffd23f"
            quality={quality}
          />
        </>
      )}

      {/* Particle light system */}
      <ParticleLights quality={quality} />

      {/* High quality exclusive lights */}
      {quality === 'high' && (
        <>
          <pointLight
            position={[0, -2, 5]}
            color="#ff6b9d"
            intensity={0.3}
            distance={8}
            decay={2}
          />

          <rectAreaLight
            position={[0, 0, -15]}
            width={20}
            height={10}
            color="#4f46e5"
            intensity={0.2}
          />
        </>
      )}

      {/* Hemisphere lighting for ambient fill */}
      <hemisphereLight
        args={[
          '#87ceeb',
          '#2c3e50',
          quality === 'low' ? 0.2 : quality === 'medium' ? 0.15 : 0.1,
        ]}
      />
    </group>
  )
}

export default Lighting
