import { motion, useAnimation } from 'framer-motion';

import useMousePosition from '../../hooks/useMousePosition';
import useMouseContext from '../../hooks/useMouseContext';

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  // * Animation
  const controls = useAnimation();
  const transition = { type: 'spring', stiffness: 100 };

  const sizeVariants = {
    initial: {
      height: '2rem',
      width: '2rem',
      transition: {
        ...transition,
      },
    },
    workCardHover: {
      height: '4rem',
      width: '4rem',
      transition: {
        ...transition,
      },
    },
  };

  const textVariants = {
    initial: {
      height: '2rem',
      width: '2rem',
      opacity: 0,
      scale: 0.5,
      transition: {
        ...transition,
      },
    },

    workCardHover: {
      height: '4rem',
      width: '4rem',
      opacity: 1,
      scale: 1,
      transition: {
        ...transition,
      },
    },
  };

  switch (mouseContext.cursorType) {
    case 'work-card-hovered':
      controls.start('workCardHover');
      break;
    default:
      controls.start('initial');
  }

  // * Render
  return (
    <div>
      <motion.div
        animate={controls}
        variants={textVariants}
        initial="initial"
        className="fixed flex items-center justify-center duration-100 pointer-events-none text-black font-bold text-xl z-50"
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      >
        READ
      </motion.div>
      <motion.div
        animate={controls}
        variants={sizeVariants}
        initial="initial"
        className="fixed mix-blend-difference duration-50 rounded-full bg-white pointer-events-none z-40"
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      ></motion.div>
    </div>
  );
}
