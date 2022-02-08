import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';

import useMousePosition from '../../hooks/useMousePosition';
import useMouseContext from '../../hooks/useMouseContext';

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  // * Styling
  const textClass = classNames(
    'fixed flex items-center justify-center duration-100 pointer-events-none text-black font-bold text-xl z-50'
  );

  const backgroundClass = classNames(
    'fixed duration-50 rounded-full bg-white pointer-events-none z-40',
    {
      'mix-blend-difference': mouseContext.cursorType != 'work-card-hovered',
    }
  );

  // * Animation
  const controls = useAnimation();
  const transition = { type: 'spring', stiffness: 100 };

  const backgroundVariants = {
    initial: {
      height: '2rem',
      width: '2rem',
      opacity: 1,
      transition: {
        ...transition,
      },
    },
    headerLinkHovered: {
      opacity: 0,
      transition: { type: 'spring', stiffness: 100 },
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
    case 'header-link-hovered':
      controls.start('headerLinkHovered');
      break;
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
        className={textClass}
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      >
        READ
      </motion.div>
      <motion.div
        animate={controls}
        variants={backgroundVariants}
        initial="initial"
        className={backgroundClass}
        style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
      ></motion.div>
    </div>
  );
}
