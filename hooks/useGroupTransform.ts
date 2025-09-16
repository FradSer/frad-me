import { useRef } from 'react';
import * as THREE from 'three';

export interface TransformValues {
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export const useGroupTransform = () => {
  const groupRef = useRef<THREE.Group>(null);

  const applyTransform = (values: TransformValues) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(
      values.position.x,
      values.position.y,
      values.position.z
    );
    groupRef.current.scale.set(
      values.scale.x,
      values.scale.y,
      values.scale.z
    );
  };

  return { groupRef, applyTransform };
};