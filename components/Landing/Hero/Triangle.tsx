import { motion, useTransform, useViewportScroll } from 'framer-motion';

import { primaryTransition } from '../../../utils/motion/springTransitions';

export default function Triangle() {
  const initialRotate = Math.random() * 360;

  const glowVariants = {
    initial: {
      rotate: initialRotate,
    },
    hover: {
      rotate: initialRotate + 45,
      transition: { ...primaryTransition },
    },
  };

  const { scrollYProgress } = useViewportScroll();

  const triangleOffsetX = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const triangleOffsetY = useTransform(scrollYProgress, [0, 0.3], [0, 400]);
  const triangleRotate = useTransform(scrollYProgress, [0, 0.3], [0, 45]);

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={glowVariants}
      style={{
        x: triangleOffsetX,
        y: triangleOffsetY,
        rotate: triangleRotate,
      }}
    >
      <svg
        viewBox="0 0 149 129"
        className="h-32 w-32 fill-black dark:fill-white"
      >
        <path d="M74.5 0L148.545 128.25H0.454826L74.5 0Z" />
      </svg>
    </motion.div>
  );
}
