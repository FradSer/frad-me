import * as THREE from 'three';

export const applyOpacityToObject = (
  object: THREE.Object3D,
  opacity: number,
) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      // Set render order for proper transparency sorting in WebXR
      child.renderOrder = opacity < 1 ? 1000 : 0;

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            material.opacity = opacity;
            material.transparent = true;
            // WebXR best practices: prevent depth write for transparent materials
            material.depthWrite = opacity >= 1;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
          }
        });
      } else {
        const material = child.material;
        if (
          material instanceof THREE.MeshBasicMaterial ||
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshLambertMaterial
        ) {
          material.opacity = opacity;
          material.transparent = true;
          // WebXR best practices: prevent depth write for transparent materials
          material.depthWrite = opacity >= 1;
          material.side = THREE.DoubleSide;
          material.needsUpdate = true;
        }
      }
    }
  });
};

/**
 * Initialize material with proper transparency settings for animations
 * This ensures materials are ready for opacity animations from the start
 * Follows WebXR best practices to avoid flickering
 */
export const initializeMaterialForOpacity = (
  material: THREE.Material,
  initialOpacity = 0,
) => {
  if (
    material instanceof THREE.MeshBasicMaterial ||
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshLambertMaterial
  ) {
    material.opacity = initialOpacity;
    material.transparent = true;
    // WebXR best practices: start with depth write disabled for transparency
    material.depthWrite = initialOpacity >= 1;
    material.side = THREE.DoubleSide;
    material.needsUpdate = true;
  }
};

/**
 * Force initialize object with complete transparency for WebXR
 * Must be called immediately when object is created
 */
export const forceInitializeTransparency = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      child.renderOrder = 1000; // Higher render order for transparent objects
      child.visible = true; // Ensure visibility is controlled by opacity only

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          initializeMaterialForOpacity(material, 0);
        });
      } else {
        initializeMaterialForOpacity(child.material, 0);
      }
    }
  });
};
