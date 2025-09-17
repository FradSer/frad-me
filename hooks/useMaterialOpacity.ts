import { useRef } from 'react';
import * as THREE from 'three';
import { PERFORMANCE_CONSTANTS } from '@/utils/constants/animation';

export const useMaterialOpacity = () => {
  const groupRef = useRef<THREE.Group>(null);

  const applyOpacity = (opacity: number, shouldBeVisible: boolean) => {
    if (!groupRef.current) return;

    // Hide completely when opacity is near zero for performance
    groupRef.current.visible = shouldBeVisible;

    // Apply opacity to all materials
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            updateMaterialOpacity(material, opacity);
          });
        } else {
          updateMaterialOpacity(child.material, opacity);
        }
      }
    });
  };

  const updateMaterialOpacity = (material: THREE.Material, opacity: number) => {
    if (
      material instanceof THREE.MeshStandardMaterial ||
      material instanceof THREE.MeshBasicMaterial
    ) {
      material.opacity = opacity;
      material.transparent = true;
    }
  };

  return { groupRef, applyOpacity };
};