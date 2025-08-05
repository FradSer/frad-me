import { useEffect, useState } from 'react'

type XRDetect = {
  isVR: boolean
}

interface NavigatorWithXR {
  xr?: {
    isSessionSupported: (mode: string) => Promise<boolean>
  }
}

// Detect if the browser is supporting WebXR
// https://developer.mozilla.org/en-US/docs/Web/API/WebXR_API
// https://www.devbridge.com/articles/ar-app-development-tutorial/
export default function useXRDetect(): XRDetect {
  const [isVR, setIsVR] = useState(false)

  useEffect(() => {
    const nav = navigator as NavigatorWithXR
    if (nav.xr) {
      nav.xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setIsVR(supported)
        })
        .catch(() => {
          setIsVR(false)
        })
    }
  }, [])

  return { isVR }
}
