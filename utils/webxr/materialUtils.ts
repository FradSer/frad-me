import * as THREE from 'three'

/**
 * Type guards and utilities for Three.js material operations
 * Provides type-safe material property access and caching
 */

// Type guard for materials with opacity support
export function hasMaterialOpacity(
  material: THREE.Material,
): material is THREE.Material & { transparent: boolean; opacity: number } {
  return 'transparent' in material && 'opacity' in material
}

// Type guard for materials with emissive intensity
export function hasMaterialEmissiveIntensity(
  material: THREE.Material,
): material is THREE.Material & { emissiveIntensity: number } {
  return 'emissiveIntensity' in material
}

// Material cache for performance optimization
class MaterialCache {
  private cache = new Map<string, THREE.Material[]>()
  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  getKey(object: THREE.Object3D): string {
    return object.uuid
  }

  getMaterials(object: THREE.Object3D): THREE.Material[] {
    const key = this.getKey(object)

    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const materials: THREE.Material[] = []
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          materials.push(...child.material)
        } else {
          materials.push(child.material)
        }
      }
    })

    // Implement LRU cache behavior
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, materials)
    return materials
  }

  clear(): void {
    this.cache.clear()
  }
}

// Global material cache instance
const materialCache = new MaterialCache()

/**
 * Efficiently applies opacity to all materials in an object hierarchy
 * Uses caching to avoid traversing the same objects repeatedly
 */
export function applyOpacityToObject(
  object: THREE.Object3D,
  opacity: number,
): void {
  const materials = materialCache.getMaterials(object)

  materials.forEach((material) => {
    if (hasMaterialOpacity(material)) {
      material.transparent = true
      material.opacity = opacity
    }
  })
}

/**
 * Efficiently applies emissive intensity to all materials in an object hierarchy
 */
export function applyEmissiveIntensityToObject(
  object: THREE.Object3D,
  intensity: number,
): void {
  const materials = materialCache.getMaterials(object)

  materials.forEach((material) => {
    if (hasMaterialEmissiveIntensity(material)) {
      material.emissiveIntensity = intensity
    }
  })
}

/**
 * Clears the material cache (useful for cleanup)
 */
export function clearMaterialCache(): void {
  materialCache.clear()
}

/**
 * Safely applies a property to materials with type checking
 */
export function applyMaterialProperty<K extends keyof THREE.Material>(
  object: THREE.Object3D,
  property: K,
  value: THREE.Material[K],
): void {
  const materials = materialCache.getMaterials(object)

  materials.forEach((material) => {
    if (property in material) {
      // Type assertion needed due to generic constraint complexity
      ;(material as any)[property] = value
    }
  })
}
