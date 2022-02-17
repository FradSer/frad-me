import Link from 'next/link';
import classNames from 'classnames';
import { motion, useAnimation } from 'framer-motion';
import useMouseContext from '../../hooks/useMouseContext';

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

  const transition = { type: 'spring', stiffness: 50 };

  const backgroundMaskVariants = {
    initial: {
      opacity: 0,
    },
    hover: {
      opacity: 1,
    },
    transition: {
      ...transition,
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
      ...transition,
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
        ...transition,
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
        className={`relative flex items-center justify-center overflow-hidden w-full ${
          props.isFullScreen
            ? 'aspect-100/62 sm:aspect-100/31 col-span-2'
            : 'aspect-100/62 col-span-2 sm:col-span-1'
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
          className="absolute w-full h-full bg-black bg-opacity-50"
        ></motion.div>
        <motion.div // Text
          animate={textControls}
          initial="initial"
          variants={textVariants}
          className={`absolute space-y-4 w-4/6 ${
            props.isCenter ? 'text-center' : 'text-left'
          }`}
        >
          <div className="text-sm xl:text-lg 2xl:text-2xl text-gray-500">
            {props.subTitle}
          </div>
          <div
            className={`text-white font-bold ${
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
