import React, { forwardRef, ReactElement } from 'react'

import * as THREE from 'three'

export type Quality = 'high' | 'medium' | 'low'
export type Position3D = [number, number, number]
export type Size3D = [number, number, number]

interface MaterialProps {
  color?: string
  emissive?: string
  emissiveIntensity?: number
  roughness?: number
  metalness?: number
  transparent?: boolean
  opacity?: number
}

interface BaseShapeProps extends MaterialProps {
  position?: Position3D
  rotation?: Position3D
  scale?: number | Position3D
  castShadow?: boolean
  receiveShadow?: boolean
  quality: Quality
  onClick?: (event: THREE.Event) => void
  onPointerOver?: (event: THREE.Event) => void
  onPointerOut?: (event: THREE.Event) => void
}

type GeometryFactory = (quality: Quality) => ReactElement

interface ShapeConfig {
  defaultCastShadow?: boolean
  defaultReceiveShadow?: boolean
}

const QUALITY_MULTIPLIERS = { high: 1, medium: 0.75, low: 0.5 } as const
const QUALITY_DETAIL = { high: 2, medium: 1, low: 0 } as const

const getQualitySegments = (quality: Quality, base: number = 32): number => {
  return Math.max(8, Math.floor(base * QUALITY_MULTIPLIERS[quality]))
}

const createMaterial = ({
  color = '#ffffff',
  emissive = color,
  emissiveIntensity = 0.2,
  roughness = 0.3,
  metalness = 0.7,
  transparent = false,
  opacity = 1
}: MaterialProps): ReactElement => (
  <meshStandardMaterial
    color={color}
    emissive={emissive}
    emissiveIntensity={emissiveIntensity}
    roughness={roughness}
    metalness={metalness}
    transparent={transparent}
    opacity={opacity}
  />
)

const createShape = <T extends BaseShapeProps>(
  geometryFactory: GeometryFactory,
  config: ShapeConfig = {}
) => {
  const { defaultCastShadow = true, defaultReceiveShadow = true } = config
  
  const ShapeComponent = forwardRef<THREE.Mesh, T>(({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    castShadow = defaultCastShadow,
    receiveShadow = defaultReceiveShadow,
    quality,
    onClick,
    onPointerOver,
    onPointerOut,
    ...materialProps
  }, ref) => (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={castShadow && quality === 'high'}
      receiveShadow={receiveShadow && quality === 'high'}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {geometryFactory(quality)}
      {createMaterial(materialProps)}
    </mesh>
  ))
  
  ShapeComponent.displayName = 'Shape'
  return ShapeComponent
}

// Shape-specific interfaces
interface BoxProps extends BaseShapeProps {
  size?: Size3D
}

interface SphereProps extends BaseShapeProps {
  radius?: number
}

interface ConeProps extends BaseShapeProps {
  radius?: number
  height?: number
}

interface CylinderProps extends BaseShapeProps {
  radiusTop?: number
  radiusBottom?: number
  height?: number
}

interface PlaneProps extends BaseShapeProps {
  width?: number
  height?: number
}

interface RingProps extends BaseShapeProps {
  innerRadius?: number
  outerRadius?: number
}

interface TorusProps extends BaseShapeProps {
  radius?: number
  tube?: number
}

interface OctahedronProps extends BaseShapeProps {
  radius?: number
}

// Shape implementations
export const Box = forwardRef<THREE.Mesh, BoxProps>(({ size = [1, 1, 1], ...props }, ref) => {
  const geometryFactory = () => <boxGeometry args={size} />
  const ShapeWithCustomGeometry = createShape<BoxProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Sphere = forwardRef<THREE.Mesh, SphereProps>(({ radius = 0.5, ...props }, ref) => {
  const geometryFactory = (quality: Quality) => {
    const segments = getQualitySegments(quality, 32)
    return <sphereGeometry args={[radius, segments, segments]} />
  }
  const ShapeWithCustomGeometry = createShape<SphereProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Cone = forwardRef<THREE.Mesh, ConeProps>(({ radius = 0.5, height = 1, ...props }, ref) => {
  const geometryFactory = (quality: Quality) => {
    const segments = getQualitySegments(quality, 32)
    return <coneGeometry args={[radius, height, segments]} />
  }
  const ShapeWithCustomGeometry = createShape<ConeProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Cylinder = forwardRef<THREE.Mesh, CylinderProps>(({ 
  radiusTop = 0.5, 
  radiusBottom = 0.5, 
  height = 1, 
  ...props 
}, ref) => {
  const geometryFactory = (quality: Quality) => {
    const segments = getQualitySegments(quality, 32)
    return <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
  }
  const ShapeWithCustomGeometry = createShape<CylinderProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Plane = forwardRef<THREE.Mesh, PlaneProps>(({ width = 1, height = 1, ...props }, ref) => {
  const geometryFactory = (quality: Quality) => {
    const segments = getQualitySegments(quality, 16)
    return <planeGeometry args={[width, height, segments, segments]} />
  }
  const ShapeWithCustomGeometry = createShape<PlaneProps>(geometryFactory, {
    defaultCastShadow: false,
    defaultReceiveShadow: true
  })
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Ring = forwardRef<THREE.Mesh, RingProps>(({ 
  innerRadius = 0.3, 
  outerRadius = 0.8, 
  ...props 
}, ref) => {
  const geometryFactory = (quality: Quality) => {
    const segments = getQualitySegments(quality, 32)
    return <ringGeometry args={[innerRadius, outerRadius, segments]} />
  }
  const ShapeWithCustomGeometry = createShape<RingProps>(geometryFactory, {
    defaultCastShadow: false,
    defaultReceiveShadow: false
  })
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Torus = forwardRef<THREE.Mesh, TorusProps>(({ radius = 0.5, tube = 0.2, ...props }, ref) => {
  const geometryFactory = (quality: Quality) => {
    const radialSegments = getQualitySegments(quality, 16)
    const tubularSegments = getQualitySegments(quality, 32)
    return <torusGeometry args={[radius, tube, radialSegments, tubularSegments]} />
  }
  const ShapeWithCustomGeometry = createShape<TorusProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

export const Octahedron = forwardRef<THREE.Mesh, OctahedronProps>(({ radius = 0.5, ...props }, ref) => {
  const geometryFactory = (quality: Quality) => {
    const detail = QUALITY_DETAIL[quality]
    return <octahedronGeometry args={[radius, detail]} />
  }
  const ShapeWithCustomGeometry = createShape<OctahedronProps>(geometryFactory)
  return <ShapeWithCustomGeometry ref={ref} {...props} />
})

// Set display names for better debugging
Box.displayName = 'ShapePrimitive.Box'
Sphere.displayName = 'ShapePrimitive.Sphere'
Cone.displayName = 'ShapePrimitive.Cone'
Cylinder.displayName = 'ShapePrimitive.Cylinder'
Plane.displayName = 'ShapePrimitive.Plane'
Ring.displayName = 'ShapePrimitive.Ring'
Torus.displayName = 'ShapePrimitive.Torus'
Octahedron.displayName = 'ShapePrimitive.Octahedron'

export const ShapesPrimitives = {
  Box,
  Sphere,
  Cone,
  Cylinder,
  Plane,
  Ring,
  Torus,
  Octahedron
}

export default ShapesPrimitives