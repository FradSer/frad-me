import React from 'react'

import { Stars } from '@react-three/drei'

import GenericCanvas from '@/components/WebXR/GeneralCanvas'
import HeroText from '@/components/WebXR/HeroText'
import WebXR3DFallback from '@/components/WebXR/WebXR3DFallback'
import WebXRErrorBoundary from '@/components/WebXR/WebXRErrorBoundary'
import { webxrErrorLogger } from '@/utils/errorLogger'
import useXRDetect from '@/hooks/useXRDetect'

const WebXR = () => {
  const xrDetect = useXRDetect()

  return (
    <WebXRErrorBoundary 
      initialLevel="webxr"
      enableAutoFallback={true}
      onError={webxrErrorLogger.logError}
    >
      {xrDetect.isVR ? (
        <div className="h-screen w-screen">
          <GenericCanvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
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
      ) : (
        <WebXR3DFallback onError={webxrErrorLogger.logError} />
      )}
    </WebXRErrorBoundary>
  )
}

export default WebXR
