import { motion } from 'framer-motion';

export default function Triangle() {
  const initialRotate = Math.random() * 360;

  const glowVariants = {
    initial: {
      rotate: initialRotate,
    },
    hover: {
      rotate: initialRotate + 45,
      transition: { type: 'spring', stiffness: 50 },
    },
  };

  return (
    <motion.div initial="initial" whileHover="hover" variants={glowVariants}>
      <svg
        viewBox="0 0 149 129"
        className="w-32 h-32 fill-black dark:fill-white"
      >
        <path d="M74.5 0L148.545 128.25H0.454826L74.5 0Z" />
      </svg>
    </motion.div>
  );
}
