import * as THREE from 'three'

export const applyOpacityToObject = (object: THREE.Object3D, opacity: number) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material instanceof THREE.MeshBasicMaterial || 
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshLambertMaterial) {
            material.opacity = opacity
            // Always set transparent to true for opacity animations
            material.transparent = true
            // Force material update to ensure proper rendering
            material.needsUpdate = true
          }
        })
      } else {
        const material = child.material
        if (material instanceof THREE.MeshBasicMaterial || 
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshLambertMaterial) {
          material.opacity = opacity
          // Always set transparent to true for opacity animations
          material.transparent = true
          // Force material update to ensure proper rendering
          material.needsUpdate = true
        }
      }
    }
  })
}

/**
 * Initialize material with proper transparency settings for animations
 * This ensures materials are ready for opacity animations from the start
 */
export const initializeMaterialForOpacity = (material: THREE.Material, initialOpacity = 0) => {
  if (material instanceof THREE.MeshBasicMaterial || 
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshLambertMaterial) {
    material.opacity = initialOpacity
    material.transparent = true
    material.needsUpdate = true
  }
}
