import React from 'react'
import { Html } from '@react-three/drei'
import { animated } from '@react-spring/three'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { useVisibilityAnimation } from '@/hooks/webxr/useVisibilityAnimation'
import { useViewportPosition } from '@/hooks/webxr/useViewportPosition'
import footerLinks from '@/content/footerLinks'

interface FooterLinks3DProps {
  visible?: boolean
}

const FooterLinks3D: React.FC<FooterLinks3DProps> = ({ visible = true }) => {
  const { footerLinksVisible } = useWebXRView()
  const position = useViewportPosition('bottomRight')
  
  const actuallyVisible = visible && footerLinksVisible
  const { scale, opacity } = useVisibilityAnimation({ 
    visible: actuallyVisible, 
    springConfig: 'gentle' 
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
        <div className="flex flex-col space-y-2 rounded-lg bg-black/20 p-3 backdrop-blur-sm">
          {footerLinks.map((link, index) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:text-white"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {link.title}
            </a>
          ))}
        </div>
      </Html>
    </animated.group>
  )
}

export default FooterLinks3D