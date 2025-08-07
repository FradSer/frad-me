import React from 'react'
import { Html } from '@react-three/drei'
import { animated } from '@react-spring/three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useVisibilityAnimation } from '@/hooks/webxr/useVisibilityAnimation'
import { useViewportPosition } from '@/hooks/webxr/useViewportPosition'

interface Navigation3DProps {
  visible?: boolean
}

const Navigation3D: React.FC<Navigation3DProps> = ({ visible = true }) => {
  const { currentView, isTransitioning, navigateToView } = useWebXRView()
  const position = useViewportPosition('topRight')

  const { scale, opacity } = useVisibilityAnimation({
    visible,
    springConfig: 'navigation',
  })

  if (!visible) return null

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
          {(['home', 'work'] as const).map((view) => (
            <button
              key={view}
              onClick={() => navigateToView(view)}
              className={`rounded px-4 py-2 text-sm font-medium transition-all duration-200 ${
                currentView === view
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
              disabled={isTransitioning}
            >
              {view === 'home' ? 'Home' : 'Work'}
            </button>
          ))}
        </div>
      </Html>
    </animated.group>
  )
}

export default Navigation3D