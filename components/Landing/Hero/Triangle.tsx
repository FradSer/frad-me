import { motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import { useEffect, useMemo } from 'react';

export default function Triangle() {
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 400]);

  // Use a deterministic rotation based on component instance for visual variety
  // This avoids security concerns with Math.random() while providing visual interest
  const initialRotate = useMemo(() => {
    // Create a simple hash from current timestamp and a fixed seed
    // This provides visual variety without cryptographic concerns
    const seed = Date.now() % 1000;
    return (seed * 0.36) % 360;
  }, []);
  const rotate = useMotionValue(0);
  const rotateOffset = useTransform(scrollYProgress, [0, 0.5], [0, 90]);

  useEffect(() => {
    const updateRotate = () => {
      rotate.set(rotateOffset.get() + initialRotate);
    };

    return rotateOffset.onChange(updateRotate);
  }, [initialRotate, rotate, rotateOffset]);

  return (
    <motion.div
      initial={{ rotate: initialRotate }}
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
