import React from 'react'

import {
  OrbitControls,
  Stars,
  Environment,
  Float,
  ContactShadows,
  Preload,
  useProgress,
} from '@react-three/drei'

import ErrorBoundary3D from './ErrorBoundary3D'

interface SceneProps {
  quality: 'high' | 'medium' | 'low'
}

// Quality-based configurations
const QUALITY_CONFIGS = {
  high: {
    stars: { count: 5000, radius: 100, depth: 50, factor: 4, speed: 1 },
    camera: {
      autoRotate: true,
      autoRotateSpeed: 0.5,
      maxDistance: 15,
      minDistance: 5,
    },
    lighting: {
      ambient: 0.5,
      directional: 1,
      shadows: true,
      shadowMapSize: 2048,
    },
  },
  medium: {
    stars: { count: 2000, radius: 80, depth: 30, factor: 3, speed: 0.5 },
    camera: {
      autoRotate: true,
      autoRotateSpeed: 0.3,
      maxDistance: 12,
      minDistance: 4,
    },
    lighting: {
      ambient: 0.5,
      directional: 1,
      shadows: false,
      shadowMapSize: 1024,
    },
  },
  low: {
    stars: { count: 1000, radius: 60, depth: 20, factor: 2, speed: 0.5 },
    camera: {
      autoRotate: false,
      autoRotateSpeed: 0,
      maxDistance: 10,
      minDistance: 3,
    },
    lighting: {
      ambient: 0.3,
      directional: 0.5,
      shadows: false,
      shadowMapSize: 1024,
    },
  },
} as const

// Material presets
const MATERIALS = {
  metallic: { roughness: 0.3, metalness: 0.7, emissiveIntensity: 0.2 },
  transparent: { transparent: true, emissiveIntensity: 0.1 },
  platform: { transparent: true, opacity: 0.3 },
  bar: { emissiveIntensity: 0.3 },
} as const

// Shape definitions
const FLOATING_SHAPES = [
  {
    type: 'cone' as const,
    position: [-8, 4, 0],
    rotation: [0.1, 0.2, 0.1],
    scale: 0.8,
    geometry: [1, 1.8, 8],
    colors: { main: '#e879f9', emissive: '#7c3aed' },
  },
  {
    type: 'box' as const,
    position: [8, 1, 0],
    scale: 1.2,
    geometry: [2, 0.8, 0.8],
    colors: { main: '#60a5fa', emissive: '#1d4ed8' },
  },
  {
    type: 'sphere' as const,
    position: [3, -4, 2],
    scale: 1.3,
    geometry: [0.8, 32, 32],
    colors: { main: '#34d399', emissive: '#059669' },
  },
] as const

// Text simulation planes
const TEXT_PLANES = [
  {
    position: [-5.3, 1, 0],
    size: [3, 0.8],
    colors: { main: '#ffffff', emissive: '#f3f4f6' },
    opacity: 0.9,
  },
  {
    position: [2, 1, 0],
    size: [4, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
  {
    position: [-1.8, 0, 0],
    size: [3.5, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
  {
    position: [-1, -1, 0],
    size: [3.8, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
  {
    position: [-1.3, -2, 0],
    size: [3.2, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
  {
    position: [0.1, -3, 0],
    size: [4.2, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
  {
    position: [-2.5, -4, 0],
    size: [2.8, 0.6],
    colors: { main: '#9ca3af', emissive: '#6b7280' },
    opacity: 0.8,
  },
] as const

// Platform elements
const PLATFORM_ELEMENTS = [
  {
    position: [0, 0, 0],
    size: [6, 0.2, 6],
    colors: { main: '#1f2937' },
    material: 'platform',
  },
  {
    position: [-2, 1, 0],
    size: [3, 0.8, 0.8],
    colors: { main: '#3b82f6', emissive: '#1d4ed8' },
    material: 'bar',
  },
  {
    position: [2, 1, 0],
    size: [3, 0.8, 0.8],
    colors: { main: '#6b7280', emissive: '#374151' },
    material: 'bar',
  },
] as const

// Reusable Mesh Component
interface MeshProps {
  type: 'cone' | 'box' | 'sphere' | 'plane'
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  geometry: number[]
  colors: { main: string; emissive?: string }
  materialType?: keyof typeof MATERIALS
  opacity?: number
}

const SceneMesh: React.FC<MeshProps> = ({
  type,
  position,
  rotation,
  scale,
  geometry,
  colors,
  materialType = 'metallic',
  opacity,
}) => {
  const materialProps = MATERIALS[materialType]

  const renderGeometry = () => {
    switch (type) {
      case 'cone':
        return <coneGeometry args={geometry as [number, number, number]} />
      case 'box':
        return <boxGeometry args={geometry as [number, number, number]} />
      case 'sphere':
        return <sphereGeometry args={geometry as [number, number, number]} />
      case 'plane':
        return <planeGeometry args={geometry as [number, number]} />
    }
  }

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {renderGeometry()}
      <meshStandardMaterial
        color={colors.main}
        emissive={colors.emissive}
        opacity={opacity}
        {...materialProps}
      />
    </mesh>
  )
}

// Lighting Component
const SceneLighting: React.FC<{ quality: SceneProps['quality'] }> = ({
  quality,
}) => {
  const config = QUALITY_CONFIGS[quality].lighting

  return (
    <>
      <ambientLight intensity={config.ambient} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={config.directional}
        castShadow={config.shadows}
        shadow-mapSize-width={config.shadowMapSize}
        shadow-mapSize-height={config.shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {quality !== 'low' && (
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.3}
          color="#4f46e5"
        />
      )}
    </>
  )
}

const Scene3DFallback: React.FC<SceneProps> = ({ quality }) => {
  const config = QUALITY_CONFIGS[quality]

  return (
    <ErrorBoundary3D>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxDistance={config.camera.maxDistance}
        minDistance={config.camera.minDistance}
        autoRotate={config.camera.autoRotate}
        autoRotateSpeed={config.camera.autoRotateSpeed}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
      />

      <SceneLighting quality={quality} />
      <fog attach="fog" args={['#1e1b4b', 20, 100]} />

      <Stars
        radius={config.stars.radius}
        depth={config.stars.depth}
        count={config.stars.count}
        factor={config.stars.factor}
        saturation={0}
        fade
        speed={config.stars.speed}
      />

      {quality === 'high' && <Environment preset="night" />}

      {/* Floating Shapes with R3F Float component */}
      <group position={[0, 0, 0]}>
        {FLOATING_SHAPES.map((shape, index) => (
          <ErrorBoundary3D key={`floating-${index}`}>
            <Float
              speed={1.5}
              rotationIntensity={0.5}
              floatIntensity={0.8}
              floatingRange={[-0.1, 0.1]}
            >
              <SceneMesh
                type={shape.type}
                position={shape.position as [number, number, number]}
                rotation={
                  ('rotation' in shape ? shape.rotation : [0, 0, 0]) as [
                    number,
                    number,
                    number,
                  ]
                }
                scale={shape.scale}
                geometry={shape.geometry as unknown as number[]}
                colors={shape.colors}
                materialType="metallic"
              />
            </Float>
          </ErrorBoundary3D>
        ))}
      </group>

      {/* Text Simulation */}
      <group position={[0, 2, -10]}>
        {TEXT_PLANES.map((plane, index) => (
          <ErrorBoundary3D key={`text-${index}`}>
            <SceneMesh
              type="plane"
              position={plane.position as [number, number, number]}
              geometry={plane.size as unknown as number[]}
              colors={plane.colors}
              materialType="transparent"
              opacity={plane.opacity}
            />
          </ErrorBoundary3D>
        ))}
      </group>

      {/* Platform with Contact Shadows */}
      <group position={[0, -6, 0]}>
        {PLATFORM_ELEMENTS.map((element, index) => (
          <ErrorBoundary3D key={`platform-${index}`}>
            <SceneMesh
              type="box"
              position={element.position as [number, number, number]}
              geometry={element.size as unknown as number[]}
              colors={element.colors}
              materialType={element.material as keyof typeof MATERIALS}
            />
          </ErrorBoundary3D>
        ))}

        {/* Add contact shadows for better ground connection */}
        {quality !== 'low' && (
          <ContactShadows
            position={[0, -0.1, 0]}
            opacity={0.4}
            scale={10}
            blur={1.5}
            far={10}
            resolution={256}
          />
        )}
      </group>

      {/* Preload assets for better performance */}
      <Preload all />
    </ErrorBoundary3D>
  )
}

export default Scene3DFallback
