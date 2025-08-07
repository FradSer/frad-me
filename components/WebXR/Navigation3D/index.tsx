import React from 'react'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { springConfigs } from '@/utils/webxr/springConfigs'

interface Navigation3DProps {
  visible?: boolean
}

const Navigation3D: React.FC<Navigation3DProps> = ({ visible = true }) => {
  const { viewport } = useThree()
  const { state, navigateToHome, navigateToWork } = useWebXRView()

  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    config: springConfigs.navigation,
  })

  if (!visible) return null

  const position: [number, number, number] = [
    viewport.width / 2 - 2, 
    viewport.height / 2 - 1, 
    0
  ]

  return (
    <animated.group scale={scale}>
      <Html
        position={position}
        transform
        occlude
        style={{
          opacity: opacity.to(o => o),
        }}
      >
        <div className="flex space-x-4 rounded-lg bg-black/20 p-3 backdrop-blur-sm">
          <button
            onClick={navigateToHome}
            className={`rounded px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.currentView === 'home'
                ? 'bg-white text-black shadow-lg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            disabled={state.isTransitioning}
          >
            Home
          </button>
          <button
            onClick={navigateToWork}
            className={`rounded px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.currentView === 'work'
                ? 'bg-white text-black shadow-lg'
                : 'text-white hover:bg-white/10 hover:text-white'
            }`}
            disabled={state.isTransitioning}
          >
            Work
          </button>
        </div>
      </Html>
    </animated.group>
  )
}

export default Navigation3D