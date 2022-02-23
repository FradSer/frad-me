import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';

import useMouseContext from '../../../hooks/useMouseContext';
import { primaryTransition } from '../../../utils/motion/springTransitions';

type IWorkCardProps = {
  title: string;
  subTitle: string;
  slug: string;
  background?: string;
  isFullScreen?: boolean;
  isCenter?: boolean;
};

export default function WorkCard<T extends IWorkCardProps>(props: T) {
  // * Styling
  const backgroundImageClass = classNames(
    'absolute w-full h-full bg-center bg-origin-border bg-cover bg-scroll',
    {
      'bg-pachino bg-red-600': props.background === 'pachino',
      'bg-black': props.background == null,
    }
  );

  // * Animation

  const backgroundImageControls = useAnimation();
  const backgroundMaskControls = useAnimation();
  const textControls = useAnimation();

  const backgroundMaskVariants = {
    initial: {
      opacity: 0,
    },
    hover: {
      opacity: 1,
    },
    transition: {
      ...primaryTransition,
    },
  };

  const backgroundImageVariants = {
    initial: {
      scale: 1.1,
    },
    hover: {
      scale: 1.2,
    },
    transition: {
      ...primaryTransition,
    },
  };

  const textVariants = {
    initial: {
      opacity: 0,
      y: -20,
    },
    hover: {
      opacity: 1,
      y: 0,
      transition: {
        ...primaryTransition,
      },
    },
  };

  // * Hooks
  const mouseContext = useMouseContext();

  // * Render

  return (
    <Link href={`/works/${props.slug}`} passHref>
      <motion.div
        onHoverStart={() => {
          mouseContext.cursorChangeHandler('work-card-hovered');
          backgroundImageControls.start(backgroundImageVariants.hover);
          backgroundMaskControls.start(backgroundMaskVariants.hover);
          textControls.start(textVariants.hover);
        }}
        onHoverEnd={() => {
          mouseContext.cursorChangeHandler('default');
          backgroundImageControls.start(backgroundImageVariants.initial);
          backgroundMaskControls.start(backgroundMaskVariants.initial);
          textControls.start(textVariants.initial);
        }}
        className={`relative flex w-full items-center justify-center overflow-hidden hover:cursor-pointer ${
          props.isFullScreen
            ? 'col-span-2 aspect-100/62 sm:aspect-100/31'
            : 'col-span-2 aspect-100/62 sm:col-span-1'
        }`}
      >
        <motion.div // Background Image
          animate={backgroundImageControls}
          initial="initial"
          variants={backgroundImageVariants}
          className={backgroundImageClass}
        ></motion.div>
        <motion.div // Background Image Mask
          animate={backgroundMaskControls}
          initial="initial"
          variants={backgroundMaskVariants}
          className="absolute h-full w-full bg-black bg-opacity-50"
        ></motion.div>
        <motion.div // Text
          animate={textControls}
          initial="initial"
          variants={textVariants}
          className={`absolute w-4/6 space-y-4 ${
            props.isCenter ? 'text-center' : 'text-left'
          }`}
        >
          <div className="text-sm text-gray-500 xl:text-lg 2xl:text-2xl">
            {props.subTitle}
          </div>
          <div
            className={`font-bold text-white ${
              props.isCenter
                ? 'text-3xl xl:text-5xl 2xl:text-7xl'
                : 'text-xl xl:text-3xl 2xl:text-5xl'
            }`}
          >
            {props.title}
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
