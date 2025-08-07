import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import * as THREE from 'three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { springConfigs } from '@/utils/webxr/springConfigs'

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
  
  const targetState = cameraStates[currentView]

  const { position, fov } = useSpring({
    position: targetState.position,
    fov: targetState.fov,
    config: springConfigs.gentle,
  })

  useFrame(() => {
    // Smoothly update camera position
    position.to((x, y, z) => {
      camera.position.lerp(new THREE.Vector3(x, y, z), 0.05)
    })

    // Update camera fov
    fov.to((f) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = f
        camera.updateProjectionMatrix()
      }
    })

    // Look at target
    targetRef.current.set(...targetState.lookAt)
    camera.lookAt(targetRef.current)
  })

  return null
}

export default CameraController3D