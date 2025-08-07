import React from 'react'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import { springConfigs } from '@/utils/webxr/springConfigs'
import footerLinks from '@/content/footerLinks'

interface FooterLinks3DProps {
  visible?: boolean
}

const FooterLinks3D: React.FC<FooterLinks3DProps> = ({ visible = true }) => {
  const { viewport } = useThree()
  const { state } = useWebXRView()

  const { position, opacity, scale } = useSpring({
    position: visible && state.footerLinksVisible ? [0, 0, 0] : [0, -3, 0],
    opacity: visible && state.footerLinksVisible ? 1 : 0,
    scale: visible && state.footerLinksVisible ? 1 : 0.8,
    config: springConfigs.gentle,
  })

  if (!visible) return null

  const htmlPosition: [number, number, number] = [
    viewport.width / 2 - 2, 
    -viewport.height / 2 + 1, 
    0
  ]

  return (
    <animated.group 
      position={position.to((x, y, z) => [x, y, z] as [number, number, number])}
      scale={scale}
    >
      <Html
        position={htmlPosition}
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