import React, { useEffect, useCallback } from 'react'
import { useXR } from '@react-three/xr'
import { useWebXRView } from '@/contexts/WebXR/WebXRViewContext'
import type { 
  VisionProEventHandlers,
  XRInputSourcesChangeEvent,
  XRInputSourceEvent,
  XRSessionEvent,
  XRTargetRayMode
} from '@/types/webxr'

interface VisionProInputHandlerProps extends VisionProEventHandlers {}

// Internal component that uses XR hooks - only rendered when XR is supported
const VisionProInputHandlerInternal: React.FC<VisionProInputHandlerProps> = ({
  onTransientPointerSelect,
  onHandTrackingStart,
  onHandTrackingEnd
}) => {
  const { session } = useXR()
  const { isVisionPro } = useWebXRView()

  const TRANSIENT_POINTER: XRTargetRayMode = 'transient-pointer'

  const handleInputSourcesChange = useCallback((event: XRInputSourcesChangeEvent) => {
    if (!isVisionPro) return

    // Vision Pro uses transient-pointer for gaze + pinch interactions
    const transientInputs = event.session.inputSources.filter(
      (source) => source.targetRayMode === TRANSIENT_POINTER
    )

    if (transientInputs.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Vision Pro transient pointer detected:', transientInputs.length)
    }
  }, [isVisionPro])

  const handleSelectStart = useCallback((event: XRInputSourceEvent) => {
    if (!isVisionPro) return

    const inputSource = event.inputSource
    
    if (inputSource.targetRayMode === TRANSIENT_POINTER) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Vision Pro gaze + pinch interaction started')
      }
      onTransientPointerSelect?.(event)
    }
  }, [isVisionPro, onTransientPointerSelect])

  const handleSelectEnd = useCallback((event: XRInputSourceEvent) => {
    if (!isVisionPro) return

    const inputSource = event.inputSource
    
    if (inputSource.targetRayMode === TRANSIENT_POINTER && process.env.NODE_ENV === 'development') {
      console.log('Vision Pro gaze + pinch interaction ended')
    }
  }, [isVisionPro])

  const handleSessionStart = useCallback((event: XRSessionEvent) => {
    if (!isVisionPro) return
    if (process.env.NODE_ENV === 'development') {
      console.log('WebXR session started on Vision Pro')
    }
    
    // Request hand tracking if available
    if (event.session.enabledFeatures?.includes('hand-tracking')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Hand tracking enabled on Vision Pro')
      }
      onHandTrackingStart?.(event)
    }
  }, [isVisionPro, onHandTrackingStart])

  const handleSessionEnd = useCallback((event: XRSessionEvent) => {
    if (!isVisionPro) return
    if (process.env.NODE_ENV === 'development') {
      console.log('WebXR session ended on Vision Pro')
    }
    onHandTrackingEnd?.(event)
  }, [isVisionPro, onHandTrackingEnd])

  useEffect(() => {
    if (!session || !isVisionPro) return

    // Add Vision Pro specific event listeners
    session.addEventListener('inputsourceschange', handleInputSourcesChange)
    session.addEventListener('selectstart', handleSelectStart)
    session.addEventListener('selectend', handleSelectEnd)
    session.addEventListener('sessionstart', handleSessionStart)
    session.addEventListener('sessionend', handleSessionEnd)

    return () => {
      session.removeEventListener('inputsourceschange', handleInputSourcesChange)
      session.removeEventListener('selectstart', handleSelectStart)
      session.removeEventListener('selectend', handleSelectEnd)
      session.removeEventListener('sessionstart', handleSessionStart)
      session.removeEventListener('sessionend', handleSessionEnd)
    }
  }, [
    session, 
    isVisionPro, 
    handleInputSourcesChange, 
    handleSelectStart, 
    handleSelectEnd,
    handleSessionStart,
    handleSessionEnd
  ])

  // This component doesn't render anything, it just handles events
  return null
}

// Wrapper component that conditionally renders the XR component
const VisionProInputHandler: React.FC<VisionProInputHandlerProps> = (props) => {
  const { webXRSupported, isVisionPro } = useWebXRView()
  
  // Only render the XR component when WebXR is supported and it's Vision Pro
  if (!webXRSupported || !isVisionPro) {
    return null
  }
  
  return <VisionProInputHandlerInternal {...props} />
}

export default VisionProInputHandler