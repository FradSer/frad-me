import { motion, useAnimation } from 'framer-motion';

export default function DotCircle() {
  const controls = useAnimation();

  const arrowVariants = {
    initial: {
      opacity: [0, 1],
      transition: { type: 'spring', stiffness: 50, delay: 2.5 },
    },
    hoverInit: {
      y: 0,
      transition: { type: 'spring', stiffness: 50 },
    },
    hoverAnim: {
      y: [6, -6, 6],
      transition: { type: 'spring', stiffness: 100, repeat: Infinity },
    },
  };

  return (
    <motion.div
      onViewportEnter={() => controls.start(arrowVariants.initial)}
      onHoverStart={() => {
        controls.start(arrowVariants.hoverAnim);
      }}
      onHoverEnd={() => {
        controls.start(arrowVariants.hoverInit);
      }}
      className="absolute bottom-4 right-0 z-30"
    >
      <motion.div
        animate={controls}
        className="absolute z-10 w-6 h-6 m-auto top-4 left-9 fill-white dark:fill-black"
      >
        <svg viewBox="0 0 18 46">
          <path d="M0.439999 31.768C1.54933 32.1947 2.57333 32.664 3.512 33.176C4.49333 33.688 5.41067 34.264 6.264 34.904L6.264 0.599999L11.512 0.599999L11.512 34.904C12.3653 34.3067 13.2613 33.752 14.2 33.24C15.1813 32.728 16.2267 32.2587 17.336 31.832L17.336 36.696C14.2213 39.3413 11.8533 42.2427 10.232 45.4L7.48 45.4C5.944 42.2427 3.59733 39.3413 0.439999 36.696L0.439999 31.768Z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ height: ['1rem', '6rem'], width: ['1rem', '6rem'] }}
        transition={{ type: 'spring', stiffness: 50, delay: 2 }}
        className="absolute z-0 "
      >
        <svg viewBox="0 0 96 96" className="fill-black dark:fill-white">
          <circle cx="48" cy="48" r="48" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
