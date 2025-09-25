import { useEffect, useState, useRef } from 'react';

import type { Position } from '@/types/common';

// https://dev.to/holdmypotion/react-custom-cursor-no-extra-dependencies-25ki
// https://gist.github.com/eldh/54954e01b40ef6fb812e2c8ee13731dc

export default function useMousePosition(): Position {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const latestPositionRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      // Store latest position immediately for accurate tracking
      latestPositionRef.current = { x: event.clientX, y: event.clientY };

      // Use requestAnimationFrame for smooth updates
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(latestPositionRef.current);
        rafRef.current = null;
      });
    };

    document.addEventListener('mousemove', updateMousePosition, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return mousePosition;
}
