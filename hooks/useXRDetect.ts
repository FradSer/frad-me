import { useEffect, useState } from 'react';

type XRDetect = {
  isXR: boolean;
};

// Detect if the browser is supporting WebXR
// https://developer.mozilla.org/en-US/docs/Web/API/WebXR_API
export default function useXRDetect(): XRDetect {
  const [isXR, setIsXR] = useState(false);

  useEffect(() => {
    if ('xr' in window.navigator) {
      setIsXR(true);
    }
  }, []);

  return { isXR };
}
