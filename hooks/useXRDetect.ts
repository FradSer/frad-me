import { useEffect, useState } from 'react';

type XRDetect = {
  isVR: boolean;
};

// Detect if the browser is supporting WebXR
// https://developer.mozilla.org/en-US/docs/Web/API/WebXR_API
// https://www.devbridge.com/articles/ar-app-development-tutorial/
export default function useXRDetect(): XRDetect {
  const [isVR, setIsXR] = useState(false);

  useEffect(() => {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      setIsXR(supported);
    });
  }, []);

  return { isVR };
}
