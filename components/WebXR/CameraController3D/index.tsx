import { useFrame, useThree } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext';
import { CAMERA_POSITIONS } from '@/utils/webxr/animationConstants';

interface CameraState {
  position: [number, number, number];
  fov: number;
  lookAt: [number, number, number];
}

const CAMERA_STATES: Record<'home' | 'work', CameraState> = {
  home: {
    position: CAMERA_POSITIONS.home.position,
    fov: 75,
    lookAt: CAMERA_POSITIONS.home.lookAt,
  },
  work: {
    position: CAMERA_POSITIONS.work.position,
    fov: 65,
    lookAt: CAMERA_POSITIONS.work.lookAt,
  },
} as const;

const LERP_SPEEDS = {
  position: 2,
  fov: 3,
} as const;

const FOV_THRESHOLD = 0.1;

const CameraController3D = memo(function CameraController3D() {
  const { currentView } = useWebXRView();
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const tempVector = useMemo(() => new THREE.Vector3(), []);

  const targetState = CAMERA_STATES[currentView];

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const [targetX, targetY, targetZ] = targetState.position;
    tempVector.set(targetX, targetY, targetZ);
    camera.position.lerp(tempVector, delta * LERP_SPEEDS.position);

    const currentFov = camera.fov;
    const targetFov = targetState.fov;
    const newFov = THREE.MathUtils.lerp(currentFov, targetFov, delta * LERP_SPEEDS.fov);

    if (Math.abs(newFov - currentFov) > FOV_THRESHOLD) {
      camera.fov = newFov;
      camera.updateProjectionMatrix();
    }

    const [lookAtX, lookAtY, lookAtZ] = targetState.lookAt;
    targetRef.current.set(lookAtX, lookAtY, lookAtZ);
    camera.lookAt(targetRef.current);
  });

  return null;
});

export default CameraController3D;
