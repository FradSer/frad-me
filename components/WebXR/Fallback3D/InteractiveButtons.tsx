import React, { useRef, useState, useMemo, useCallback } from 'react'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Quality = 'high' | 'medium' | 'low'
type Position3D = [number, number, number]
type Size3D = [number, number, number]

interface BaseInteractiveProps {
  position: Position3D
  onClick: () => void
  color: string
  quality: Quality
}

interface InteractiveButtonProps extends BaseInteractiveProps {
  text: string
  hoverColor: string
  size: Size3D
}

interface FloatingActionButtonProps extends BaseInteractiveProps {
  icon: string
}

interface PulsingIndicatorProps {
  position: Position3D
  color: string
  quality: Quality
}

interface InteractiveButtonsProps {
  quality: Quality
}

// Shared animation and interaction logic
const useInteractiveState = () => {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const createClickHandler = useCallback((onClick: () => void) => {
    return (e: any) => {
      e.stopPropagation()
      setClicked(true)
      setTimeout(() => setClicked(false), 200)
      onClick()
    }
  }, [])

  return {
    hovered,
    clicked,
    handlePointerOver,
    handlePointerOut,
    createClickHandler
  }
}

// Shared geometry and material utilities
const getQualitySegments = (quality: Quality): number => {
  const segmentMap = { low: 8, medium: 16, high: 32 }
  return segmentMap[quality]
}

const getSphereSegments = (quality: Quality): number => {
  const segmentMap = { low: 16, medium: 24, high: 32 }
  return segmentMap[quality]
}

const createStandardMaterial = (color: string, emissiveIntensity: number, opacity = 0.9) => ({
  color,
  emissive: color,
  emissiveIntensity,
  roughness: 0.3,
  metalness: 0.7,
  transparent: true,
  opacity
})

// Unified animation hook
const useUnifiedAnimation = (
  meshRef: React.RefObject<THREE.Mesh>,
  groupRef: React.RefObject<THREE.Group> | null,
  position: Position3D,
  hovered: boolean,
  clicked: boolean,
  animationType: 'button' | 'floating' | 'pulsing'
) => {
  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime
    const mesh = meshRef.current
    const material = mesh.material as THREE.MeshStandardMaterial

    // Common scaling animation
    const getTargetScale = () => {
      switch (animationType) {
        case 'button':
          return clicked ? 0.95 : hovered ? 1.05 : 1
        case 'floating':
          return hovered ? 1.2 : 1
        case 'pulsing':
          return Math.sin(time * 4) * 0.3 + 1
        default:
          return 1
      }
    }

    const targetScale = getTargetScale()
    const lerpSpeed = animationType === 'floating' ? 0.15 : 0.1
    const newScale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, lerpSpeed)
    mesh.scale.setScalar(newScale)

    // Position animations
    if (animationType === 'button' && groupRef?.current) {
      const floatY = Math.sin(time * 2) * 0.05
      groupRef.current.position.y = position[1] + floatY
    } else if (animationType === 'floating') {
      const bobAmount = Math.sin(time * 3) * 0.1
      const rotateAmount = Math.sin(time * 2) * 0.05
      mesh.position.y = position[1] + bobAmount
      mesh.rotation.z = rotateAmount
    }

    // Material animations
    if (animationType === 'button') {
      const glowIntensity = hovered ? 0.4 : 0.2
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, glowIntensity, 0.1)
      
      if (clicked) {
        mesh.rotation.z = Math.sin(time * 15) * 0.01
      }
    } else if (animationType === 'floating') {
      material.emissiveIntensity = hovered ? 0.4 : 0.2
    } else if (animationType === 'pulsing') {
      material.opacity = (Math.sin(time * 4) * 0.2 + 0.6) * 0.7
    }
  })
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  position,
  text,
  onClick,
  color,
  hoverColor,
  size,
  quality
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { hovered, clicked, handlePointerOver, handlePointerOut, createClickHandler } = useInteractiveState()
  
  useUnifiedAnimation(meshRef, groupRef, position, hovered, clicked, 'button')
  
  const handleClick = useMemo(() => createClickHandler(onClick), [createClickHandler, onClick])
  const buttonColor = hovered ? hoverColor : color
  const segments = getQualitySegments(quality)
  const materialProps = useMemo(() => createStandardMaterial(buttonColor, 0.2), [buttonColor])

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow={quality === 'high'}
        receiveShadow={quality === 'high'}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {quality !== 'low' && (
        <mesh position={[0, 0, size[2] / 2 + 0.01]}>
          <planeGeometry args={[size[0] * 0.9, size[1] * 0.9]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={hovered ? 0.8 : 0.6}
            emissive="#ffffff"
            emissiveIntensity={hovered ? 0.1 : 0.05}
          />
        </mesh>
      )}

      <Html
        position={[0, 0, size[2] / 2 + 0.02]}
        transform
        occlude
        style={{
          color: '#1f2937',
          fontSize: quality === 'low' ? '12px' : '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <div>{text}</div>
      </Html>

      {hovered && quality === 'high' && (
        <mesh position={[0, 0, -size[2] / 2 - 0.1]}>
          <ringGeometry args={[size[0] * 0.8, size[0] * 1.2, segments]} />
          <meshStandardMaterial
            color={hoverColor}
            transparent
            opacity={0.3}
            emissive={hoverColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  position, 
  icon, 
  onClick, 
  color, 
  quality 
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { hovered, handlePointerOver, handlePointerOut, createClickHandler } = useInteractiveState()
  
  useUnifiedAnimation(meshRef, null, position, hovered, false, 'floating')
  
  const handleClick = useMemo(() => createClickHandler(onClick), [createClickHandler, onClick])
  const segments = getSphereSegments(quality)
  const materialProps = useMemo(() => ({
    ...createStandardMaterial(color, hovered ? 0.4 : 0.2),
    roughness: 0.2,
    metalness: 0.8
  }), [color, hovered])

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow={quality === 'high'}
      receiveShadow={quality === 'high'}
    >
      <sphereGeometry args={[0.5, segments, segments]} />
      <meshStandardMaterial {...materialProps} />
      
      <Html
        position={[0, 0, 0]}
        transform
        occlude
        style={{
          color: 'white',
          fontSize: '20px',
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <div>{icon}</div>
      </Html>
    </mesh>
  )
}

const PulsingIndicator: React.FC<PulsingIndicatorProps> = ({ position, color, quality }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useUnifiedAnimation(meshRef, null, position, false, false, 'pulsing')
  
  const segments = getQualitySegments(quality)
  const materialProps = useMemo(() => ({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.7
  }), [color])

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.2, 0.4, segments]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  )
}

const InteractiveButtons: React.FC<InteractiveButtonsProps> = ({ quality }) => {
  const handlers = useMemo(() => ({
    tryWebXRAgain: () => window.location.reload(),
    explorePortfolio: () => window.location.href = '/',
    downloadResume: () => console.log('Download resume clicked'),
    contactMe: () => console.log('Contact me clicked')
  }), [])

  const platformMaterial = useMemo(() => ({
    color: '#1f2937',
    transparent: true,
    opacity: 0.3,
    roughness: 0.8
  }), [])

  const buttonConfigs = useMemo(() => ([
    {
      position: [-3, 1, 0] as Position3D,
      text: 'Try WebXR Again',
      onClick: handlers.tryWebXRAgain,
      color: '#3b82f6',
      hoverColor: '#1d4ed8'
    },
    {
      position: [3, 1, 0] as Position3D,
      text: 'Explore Portfolio',
      onClick: handlers.explorePortfolio,
      color: '#6b7280',
      hoverColor: '#374151'
    }
  ]), [handlers])

  const floatingConfigs = useMemo(() => ([
    {
      position: [-6, 2, 2] as Position3D,
      icon: '📄',
      onClick: handlers.downloadResume,
      color: '#10b981'
    },
    {
      position: [6, 2, 2] as Position3D,
      icon: '✉️',
      onClick: handlers.contactMe,
      color: '#f59e0b'
    }
  ]), [handlers])

  const indicatorConfigs = useMemo(() => ([
    { position: [-3, 2.2, 0] as Position3D, color: '#3b82f6' },
    { position: [3, 2.2, 0] as Position3D, color: '#6b7280' }
  ]), [])

  return (
    <group position={[0, -6, 0]}>
      <mesh position={[0, 0, 0]} receiveShadow={quality === 'high'}>
        <boxGeometry args={[12, 0.2, 8]} />
        <meshStandardMaterial {...platformMaterial} />
      </mesh>

      {buttonConfigs.map((config, index) => (
        <InteractiveButton
          key={index}
          {...config}
          size={[4, 1, 0.5]}
          quality={quality}
        />
      ))}

      {quality !== 'low' && (
        <>
          {floatingConfigs.map((config, index) => (
            <FloatingActionButton key={index} {...config} quality={quality} />
          ))}
          
          {indicatorConfigs.map((config, index) => (
            <PulsingIndicator key={index} {...config} quality={quality} />
          ))}
        </>
      )}

      {quality === 'high' && (
        <Html
          position={[0, -1, 0]}
          transform
          occlude
          style={{
            color: 'white',
            fontSize: '12px',
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
            opacity: 0.6
          }}
        >
          <div className="animate-pulse">
            Click or hover to interact with elements
          </div>
        </Html>
      )}
    </group>
  )
}

export default InteractiveButtons