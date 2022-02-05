import { motion, useAnimation } from 'framer-motion';

import useMousePosition from '../../hooks/useMousePosition';
import useMouse from '../../hooks/useMouse';

import { MouseContext } from '../../context/Mouse/MouseContext';

export default function DotRing() {
  // * Hooks
  const { x, y } = useMousePosition();
  const { cursorType, cursorChangeHandler } = useMouse();

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

  switch (cursorType) {
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
        className="fixed flex items-center justify-center duration-100 pointer-events-none text-black font-bold text-xl z-50"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        READ
      </motion.div>
      <motion.div
        animate={controls}
        variants={sizeVariants}
        className="fixed mix-blend-difference duration-50 rounded-full bg-white pointer-events-none z-40"
        style={{ left: `${x}px`, top: `${y}px` }}
      ></motion.div>
    </div>
  );
}
