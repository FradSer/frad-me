import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'

const cameraStates = {
  home: { 
    position: [0, 0, 5] as [number, number, number], 
    fov: 75,
    lookAt: [0, 0, 0] as [number, number, number]
  },
  work: { 
    position: [0, 2, 8] as [number, number, number], 
    fov: 65,
    lookAt: [0, 0, 0] as [number, number, number]
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
    tempVector.set(...targetState.position)
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
    targetRef.current.set(...targetState.lookAt)
    camera.lookAt(targetRef.current)
  })

  return null
}

export default CameraController3D