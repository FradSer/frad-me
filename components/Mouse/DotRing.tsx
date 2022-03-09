import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';

import useMouseContext from '../../hooks/useMouseContext';
import useMousePosition from '../../hooks/useMousePosition';
import { primaryTransition } from '../../utils/motion/springTransitions';

export default function DotRing() {
  // * Hooks
  const mousePosition = useMousePosition();
  const mouseContext = useMouseContext();

  // * Styling
  const textClass = classNames(
    'fixed flex items-center justify-center duration-200 pointer-events-none text-black font-bold text-xl z-50'
  );

  const backgroundClass = classNames(
    'fixed rounded-full bg-white pointer-events-none z-40 duration-100',
    {
      'mix-blend-difference': mouseContext.cursorType != 'work-card-hovered',
    }
  );

  // * Animation
  const controls = useAnimation();

  const transitionOffset = { x: '-50%', y: '-50%' };

  const backgroundVariants = {
    initial: {
      ...transitionOffset,
      height: '1rem',
      width: '1rem',
      opacity: 1,
      transition: {
        ...primaryTransition,
      },
    },
    headerLinkHovered: {
      opacity: 0,
      transition: { ...primaryTransition },
    },
    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      transition: {
        ...primaryTransition,
      },
    },
  };

  const textVariants = {
    initial: {
      ...transitionOffset,
      height: '2rem',
      width: '2rem',
      opacity: 0,
      scale: 0.5,
      transition: {
        ...primaryTransition,
      },
    },

    workCardHover: {
      ...transitionOffset,
      height: '4rem',
      width: '4rem',
      opacity: 1,
      scale: 1,
      transition: {
        ...primaryTransition,
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