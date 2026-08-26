'use client';

import { motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import { useEffect } from 'react';

export default function Triangle() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 400]);

  // Rotation follows scroll progress. The initial value stays constant so the
  // server-rendered markup matches the client and prerendering stays pure.
  const rotate = useMotionValue(0);
  const rotateOffset = useTransform(scrollYProgress, [0, 0.5], [0, 90]);

  useEffect(() => {
    const updateRotate = (v: number) => {
      rotate.set(v);
    };

    // Initialize once so the derived value is not stale before first scroll event
    updateRotate(rotateOffset.get());

    return rotateOffset.on('change', updateRotate);
  }, [rotate, rotateOffset]);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
      }}
    >
      <svg
        className="h-20 w-20 fill-black dark:fill-white sm:h-24 sm:w-24 lg:h-28 lg:w-28 2xl:h-32 2xl:w-32"
        viewBox="0 0 24 24"
        aria-label="Triangle decoration"
      >
        <title>Triangle decoration</title>
        <path d="M12 2 22 20 2 20z" />
      </svg>
    </motion.div>
  );
}
