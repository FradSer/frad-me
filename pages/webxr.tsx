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
      {/* Always show 3D fallback for now, VR version can be accessed separately */}
      <WebXR3DFallback onError={webxrErrorLogger.logError} />
    </WebXRErrorBoundary>
  )
}

export default WebXR
