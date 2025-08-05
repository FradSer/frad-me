import React from 'react'

import { Stars } from '@react-three/drei'

import GenericCanvas from '@/components/WebXR/GeneralCanvas'
import HeroText from '@/components/WebXR/HeroText'
import WebXR2DFallback from '@/components/WebXR/WebXR2DFallback'
import WebXRErrorBoundary from '@/components/WebXR/WebXRErrorBoundary'
import { webxrErrorLogger } from '@/utils/errorLogger'

const WebXR = () => {
  return (
    <WebXRErrorBoundary 
      fallback={<WebXR2DFallback />}
      onError={webxrErrorLogger.logError}
    >
      <div className="h-screen w-screen">
        <GenericCanvas>
          <mesh position={[0, 2, -10]}>
            <HeroText />
          </mesh>

          <Stars
            radius={5}
            depth={50}
            count={500}
            factor={10}
            saturation={0}
            fade
          />
        </GenericCanvas>
      </div>
    </WebXRErrorBoundary>
  )
}

export default WebXR
