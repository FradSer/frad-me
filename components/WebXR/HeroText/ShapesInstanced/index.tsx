'use client';

import { useFrame } from '@react-three/fiber';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSimpleLerp } from '@/hooks/useSimpleLerp';

const GEOMETRY_ARGS = {
  box: [3, 1, 1] as [number, number, number],
  cone: [1, 1.4, 3, 1] as [number, number, number, number],
  sphere: [0.65, 16, 16] as [number, number, number],
} as const;

const ROTATION_SPEEDS: Record<string, number> = {
  default: 10,
  sphere: 5,
};

const SCALE_FACTORS = {
  triangle: 1.5,
  sphere: 1.5,
} as const;

type RotationAxis = 'x' | 'y' | 'z';
type ShapeType = 'box' | 'triangle' | 'sphere';

interface ShapeData {
  type: ShapeType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

interface ShapeInstanceState {
  managerIndex: 0 | 1 | 2;
  instanceId: number;
  rotationAxis: RotationAxis;
  rotationSpeed: number;
  baseScale: number;
  baseRotation: [number, number, number];
  currentRotation: [number, number, number];
  active: boolean;
  hovered: boolean;
}

interface ShapesInstancedProps {
  shapes: ShapeData[];
  onHover?: (index: number, hovered: boolean) => void;
  onClick?: (index: number) => void;
}

const lerpSpeed = 0.03;
const fastLerpSpeed = 0.1;

const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3();
const tempEuler = new THREE.Euler();

const ShapesInstanced = memo<ShapesInstancedProps>(function ShapesInstanced({
  shapes,
  onHover,
  onClick,
}) {
  const boxMeshRef = useRef<THREE.InstancedMesh>(null);
  const coneMeshRef = useRef<THREE.InstancedMesh>(null);
  const sphereMeshRef = useRef<THREE.InstancedMesh>(null);

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const shapeStatesRef = useRef<Map<number, ShapeInstanceState>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Individual hooks for spring values as per React's rules (limit 10)
  const s1 = useSimpleLerp(1, { speed: lerpSpeed });
  const s2 = useSimpleLerp(1, { speed: lerpSpeed });
  const s3 = useSimpleLerp(1, { speed: lerpSpeed });
  const s4 = useSimpleLerp(1, { speed: lerpSpeed });
  const s5 = useSimpleLerp(1, { speed: lerpSpeed });
  const s6 = useSimpleLerp(1, { speed: lerpSpeed });
  const s7 = useSimpleLerp(1, { speed: lerpSpeed });
  const s8 = useSimpleLerp(1, { speed: lerpSpeed });
  const s9 = useSimpleLerp(1, { speed: lerpSpeed });
  const s10 = useSimpleLerp(1, { speed: lerpSpeed });

  const r1 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r2 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r3 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r4 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r5 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r6 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r7 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r8 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r9 = useSimpleLerp(0, { speed: fastLerpSpeed });
  const r10 = useSimpleLerp(0, { speed: fastLerpSpeed });

  const scaleSprings = useMemo(() => [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10], [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10]);
  const rotationSprings = useMemo(() => [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10], [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10]);

  // Group shapes by type and create mappings
  const { boxes, cones, spheres, shapeToManagerIndex } = useMemo(() => {
    const boxesArr: ShapeData[] = [];
    const conesArr: ShapeData[] = [];
    const spheresArr: ShapeData[] = [];
    const indexToManagerIndex = new Map<number, { managerIndex: 0 | 1 | 2; instanceId: number }>();

    let boxIndex = 0;
    let coneIndex = 0;
    let sphereIndex = 0;

    shapes.forEach((shape, index) => {
      if (shape.type === 'box') {
        boxesArr.push(shape);
        indexToManagerIndex.set(index, { managerIndex: 0, instanceId: boxIndex });
        boxIndex++;
      } else if (shape.type === 'triangle') {
        conesArr.push(shape);
        indexToManagerIndex.set(index, { managerIndex: 1, instanceId: coneIndex });
        coneIndex++;
      } else if (shape.type === 'sphere') {
        spheresArr.push(shape);
        indexToManagerIndex.set(index, { managerIndex: 2, instanceId: sphereIndex });
        sphereIndex++;
      }
    });

    return {
      boxes: boxesArr,
      cones: conesArr,
      spheres: spheresArr,
      shapeToManagerIndex: indexToManagerIndex,
    };
  }, [shapes]);

  // Initialize instanced meshes and geometries
  useEffect(() => {
    const boxGeometry = new THREE.BoxGeometry(...GEOMETRY_ARGS.box);
    const coneGeometry = new THREE.ConeGeometry(...GEOMETRY_ARGS.cone);
    const sphereGeometry = new THREE.SphereGeometry(...GEOMETRY_ARGS.sphere);

    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.1,
    });
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.1,
    });
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.1,
    });

    const boxMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, boxes.length);
    const coneMesh = new THREE.InstancedMesh(coneGeometry, coneMaterial, cones.length);
    const sphereMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, spheres.length);

    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    coneMesh.castShadow = true;
    coneMesh.receiveShadow = true;
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;

    boxMeshRef.current = boxMesh;
    coneMeshRef.current = coneMesh;
    sphereMeshRef.current = sphereMesh;

    const shapeStates = new Map<number, ShapeInstanceState>();

    shapes.forEach((shape, index) => {
      const managerInfo = shapeToManagerIndex.get(index);
      if (!managerInfo) return;

      let rotationAxis: RotationAxis = 'x';
      let rotationSpeed = ROTATION_SPEEDS.default;
      let baseScale = 1;
      const baseRotation = shape.rotation ?? [0, 0, 0];

      if (shape.type === 'box') {
        rotationAxis = 'x';
        baseScale = shape.scale ?? 1;
      } else if (shape.type === 'triangle') {
        rotationAxis = 'z';
        baseScale = (shape.scale ?? 1) * SCALE_FACTORS.triangle;
      } else if (shape.type === 'sphere') {
        rotationAxis = 'y';
        rotationSpeed = ROTATION_SPEEDS.sphere;
        baseScale = (shape.scale ?? 1) * SCALE_FACTORS.sphere;
      }

      // Set initial matrix
      const instanceId = managerInfo.instanceId;
      const meshIndex = managerInfo.managerIndex;

      tempPosition.set(shape.position[0], shape.position[1], shape.position[2]);
      tempEuler.set(baseRotation[0], baseRotation[1], baseRotation[2]);
      tempQuaternion.setFromEuler(tempEuler);
      tempScale.set(baseScale, baseScale, baseScale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);

      if (meshIndex === 0) {
        boxMesh.setMatrixAt(instanceId, tempMatrix);
      } else if (meshIndex === 1) {
        coneMesh.setMatrixAt(instanceId, tempMatrix);
      } else if (meshIndex === 2) {
        sphereMesh.setMatrixAt(instanceId, tempMatrix);
      }

      shapeStates.set(index, {
        managerIndex: meshIndex,
        instanceId,
        rotationAxis,
        rotationSpeed,
        baseScale,
        baseRotation,
        currentRotation: [baseRotation[0], baseRotation[1], baseRotation[2]],
        active: false,
        hovered: false,
      });
    });

    shapeStatesRef.current = shapeStates;

    boxMesh.instanceMatrix.needsUpdate = true;
    coneMesh.instanceMatrix.needsUpdate = true;
    sphereMesh.instanceMatrix.needsUpdate = true;

    setIsInitialized(true);

    return () => {
      boxGeometry.dispose();
      coneGeometry.dispose();
      sphereGeometry.dispose();
      boxMaterial.dispose();
      coneMaterial.dispose();
      sphereMaterial.dispose();
      boxMesh.dispose();
      coneMesh.dispose();
      sphereMesh.dispose();
      setIsInitialized(false);
    };
  }, [shapes, boxes, cones, spheres, shapeToManagerIndex]);

  // Animation loop
  useFrame((_, delta) => {
    if (!isInitialized) return;

    const boxMesh = boxMeshRef.current;
    const coneMesh = coneMeshRef.current;
    const sphereMesh = sphereMeshRef.current;

    if (!boxMesh && !coneMesh && !sphereMesh) return;

    const meshes: [
      THREE.InstancedMesh | null,
      THREE.InstancedMesh | null,
      THREE.InstancedMesh | null,
    ] = [boxMesh, coneMesh, sphereMesh];

    shapeStatesRef.current.forEach((state, index) => {
      const scaleSpring = scaleSprings[index];
      const rotationSpring = rotationSprings[index];
      const mesh = meshes[state.managerIndex];

      if (!mesh || !scaleSpring || !rotationSpring) return;

      const speed = state.rotationSpeed;

      // Apply rotation animation
      const axisIndex = state.rotationAxis === 'x' ? 0 : state.rotationAxis === 'y' ? 1 : 2;
      state.currentRotation[axisIndex] += delta / speed;

      if (state.rotationAxis !== 'y') {
        state.currentRotation[1] += rotationSpring.value * delta;
      }
      if (state.rotationAxis !== 'x') {
        state.currentRotation[0] += rotationSpring.value * delta * 0.5;
      }

      const currentScale = scaleSpring.value * state.baseScale;

      // Update transform
      const shapeData = shapes[index];
      tempPosition.set(shapeData.position[0], shapeData.position[1], shapeData.position[2]);
      tempEuler.set(state.currentRotation[0], state.currentRotation[1], state.currentRotation[2]);
      tempQuaternion.setFromEuler(tempEuler);
      tempScale.set(currentScale, currentScale, currentScale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(state.instanceId, tempMatrix);
      mesh.instanceMatrix.needsUpdate = true;

      // Update color based on hover state
      if (mesh.instanceColor) {
        const color = state.hovered ? new THREE.Color(0x808080) : new THREE.Color(0xffffff);
        mesh.setColorAt(state.instanceId, color);
        mesh.instanceColor.needsUpdate = true;
      }
    });
  });

  const handlePointerMove = useCallback(
    (event: THREE.Event) => {
      if (!isInitialized) return;

      const threeEvent = event as unknown as {
        clientX: number;
        clientY: number;
        camera: THREE.Camera;
      };

      pointerRef.current.x = (threeEvent.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(threeEvent.clientY / window.innerHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, threeEvent.camera);

      const meshes = [boxMeshRef.current, coneMeshRef.current, sphereMeshRef.current].filter(
        (m): m is THREE.InstancedMesh => m !== null,
      );

      if (meshes.length === 0) return;

      let foundInstanceId = -1;
      let foundMeshIndex = -1;

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const intersections = raycasterRef.current.intersectObject(mesh);

        if (intersections.length > 0 && foundInstanceId === -1) {
          foundInstanceId = intersections[0].instanceId ?? -1;
          foundMeshIndex = i;
          break;
        }
      }

      // Find the shape index from instance ID
      let hoveredShapeIndex = -1;

      if (foundInstanceId >= 0) {
        shapeToManagerIndex.forEach((info, shapeIndex) => {
          if (info.managerIndex === foundMeshIndex && info.instanceId === foundInstanceId) {
            hoveredShapeIndex = shapeIndex;
          }
        });
      }

      shapeStatesRef.current.forEach((state, index) => {
        const wasHovered = state.hovered;
        const isHovered = index === hoveredShapeIndex;

        if (wasHovered !== isHovered) {
          state.hovered = isHovered;
          onHover?.(index, isHovered);

          const scaleSpring = scaleSprings[index];
          const rotationSpring = rotationSprings[index];

          if (scaleSpring && rotationSpring) {
            if (isHovered && !state.active) {
              scaleSpring.set(1.1);
              rotationSpring.set(1);
            } else if (!isHovered && !state.active) {
              scaleSpring.set(1);
              rotationSpring.set(0);
            }
          }
        }
      });
    },
    [isInitialized, onHover, shapeToManagerIndex, scaleSprings, rotationSprings],
  );

  const handlePointerLeave = useCallback(() => {
    if (!isInitialized) return;

    shapeStatesRef.current.forEach((state, index) => {
      if (state.hovered) {
        state.hovered = false;
        onHover?.(index, false);

        const scaleSpring = scaleSprings[index];
        const rotationSpring = rotationSprings[index];

        if (scaleSpring && rotationSpring && !state.active) {
          scaleSpring.set(1);
          rotationSpring.set(0);
        }
      }
    });
  }, [isInitialized, onHover, scaleSprings, rotationSprings]);

  const handleClick = useCallback(
    (_event: THREE.Event) => {
      if (!isInitialized) return;

      const meshes = [boxMeshRef.current, coneMeshRef.current, sphereMeshRef.current].filter(
        (m): m is THREE.InstancedMesh => m !== null,
      );

      if (meshes.length === 0) return;

      let foundInstanceId = -1;
      let foundMeshIndex = -1;

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const intersections = raycasterRef.current.intersectObject(mesh);

        if (intersections.length > 0 && foundInstanceId === -1) {
          foundInstanceId = intersections[0].instanceId ?? -1;
          foundMeshIndex = i;
          break;
        }
      }

      // Find the shape index from instance ID
      let clickedShapeIndex = -1;

      if (foundInstanceId >= 0) {
        shapeToManagerIndex.forEach((info, shapeIndex) => {
          if (info.managerIndex === foundMeshIndex && info.instanceId === foundInstanceId) {
            clickedShapeIndex = shapeIndex;
          }
        });
      }

      if (clickedShapeIndex >= 0) {
        const state = shapeStatesRef.current.get(clickedShapeIndex);
        if (state) {
          const newActive = !state.active;
          state.active = newActive;

          const scaleSpring = scaleSprings[clickedShapeIndex];
          const rotationSpring = rotationSprings[clickedShapeIndex];

          if (scaleSpring && rotationSpring) {
            if (newActive) {
              scaleSpring.set(1.3);
              rotationSpring.set(2);
            } else {
              scaleSpring.set(state.hovered ? 1.1 : 1);
              rotationSpring.set(state.hovered ? 1 : 0);
            }
          }

          onClick?.(clickedShapeIndex);
        }
      }
    },
    [isInitialized, onClick, shapeToManagerIndex, scaleSprings, rotationSprings],
  );

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {isInitialized && boxMeshRef.current && <primitive object={boxMeshRef.current} />}
      {isInitialized && coneMeshRef.current && <primitive object={coneMeshRef.current} />}
      {isInitialized && sphereMeshRef.current && <primitive object={sphereMeshRef.current} />}
    </group>
  );
});

export default ShapesInstanced;
export type { ShapeData, ShapesInstancedProps };
