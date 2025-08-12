import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { CAMERA_POSITIONS } from '@/utils/webxr/animationConstants'

const cameraStates = {
  home: { 
    position: CAMERA_POSITIONS.home.position, 
    fov: 75,
    lookAt: CAMERA_POSITIONS.home.lookAt
  },
  work: { 
    position: CAMERA_POSITIONS.work.position, 
    fov: 65,
    lookAt: CAMERA_POSITIONS.work.lookAt
  }
} as const

const CameraController3D: React.FC = () => {
  const { currentView } = useWebXRView()
  const { camera } = useThree()
  const targetRef = useRef(new THREE.Vector3())
  
  // Create reusable vector objects to avoid allocation in frame loop
  const tempVector = useMemo(() => new THREE.Vector3(), [])
  
  const targetState = cameraStates[currentView]

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return

    // Smooth camera position animation
    tempVector.set(targetState.position[0], targetState.position[1], targetState.position[2])
    camera.position.lerp(tempVector, delta * 2)

    // Smooth FOV animation
    const targetFov = targetState.fov
    const currentFov = camera.fov
    const newFov = THREE.MathUtils.lerp(currentFov, targetFov, delta * 3)
    
    if (Math.abs(newFov - currentFov) > 0.1) {
      camera.fov = newFov
      camera.updateProjectionMatrix()
    }

    // Look at target
    targetRef.current.set(targetState.lookAt[0], targetState.lookAt[1], targetState.lookAt[2])
    camera.lookAt(targetRef.current)
  })

  return null
}

export default CameraController3D