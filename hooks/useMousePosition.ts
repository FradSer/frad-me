import { throttle } from 'lodash';
import { useEffect, useState } from 'react';

type MousePosition = { x: number; y: number };

// https://dev.to/holdmypotion/react-custom-cursor-no-extra-dependencies-25ki
// https://gist.github.com/eldh/54954e01b40ef6fb812e2c8ee13731dc

export default function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const updateMousePosition = throttle((event: MouseEvent) => {
      const { clientX, clientY } = event;
      setMousePosition({ x: clientX, y: clientY });
    }, 50);
    document.addEventListener('mousemove', updateMousePosition);
    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
}
