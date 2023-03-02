import { useEffect, useState } from 'react'

type XRDetect = {
  isVR: boolean
}

declare const navigator: any

// Detect if the browser is supporting WebXR
// https://developer.mozilla.org/en-US/docs/Web/API/WebXR_API
// https://www.devbridge.com/articles/ar-app-development-tutorial/
export default function useXRDetect(): XRDetect {
  const [isVR, setIsVR] = useState(false)

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setIsVR(supported)
        })
    }
  }, [])

  return { isVR }
}
