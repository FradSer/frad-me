'use client';

import { motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';

import useMousePosition from '@/hooks/useMousePosition';
import useWindowSize from '@/hooks/useWindowSize';
import { calculateSkew } from '@/utils/motion/animationUtils';

export default function Rectangle() {
  const mousePosition = useMousePosition();
  const size = useWindowSize();

  const { xValue, yValue } = calculateSkew(mousePosition, size, 2);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const skewX = useTransform(mouseX, [0, 1], [2, -2], { clamp: true });
  const skewY = useTransform(mouseY, [0, 1], [-2, 2], { clamp: true });

  // Hydrate with the same neutral transform as SSR, then follow the pointer.
  useEffect(() => {
    mouseX.set(xValue);
    mouseY.set(yValue);
  }, [mouseX, mouseY, xValue, yValue]);

  return (
    <div className="ml-2 flex grow lg:ml-8">
      <motion.div
        className="h-full w-full bg-black dark:bg-white"
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
      ></motion.div>
    </div>
  );
}
