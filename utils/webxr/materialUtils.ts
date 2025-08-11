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
            material.transparent = opacity < 1
          }
        })
      } else {
        const material = child.material
        if (material instanceof THREE.MeshBasicMaterial || 
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshLambertMaterial) {
          material.opacity = opacity
          material.transparent = opacity < 1
        }
      }
    }
  })
}