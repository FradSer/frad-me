import classNames from 'classnames';
import { motion } from 'framer-motion';

type IWorkImageProps = {
  position: ImagePosition;
};

enum ImagePosition {
  inline = 'inline',
  underH2 = 'underH2',
  fullScreen = 'fullScreen',
}

function WorkImage({ position }: IWorkImageProps) {
  // * Styling
  const workImageClass = classNames({
    'col-span-16 mt-0 h-32 bg-black md:col-span-5':
      position === ImagePosition.inline,
    'col-span-16 w-full h-screen bg-black':
      position === ImagePosition.fullScreen,
    'col-span-16 mt-0 h-32 bg-black md:col-span-5 md:mt-[-3.25rem]':
      position === ImagePosition.underH2,
  });

  // * Animation
  const imageVariants = {
    hidden: {
      opacity: 0,
      y: '20%',
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'linear',
      },
    },
  };

  // * Render
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={imageVariants}
      viewport={{ once: true }}
      className={workImageClass}
    />
  );
}

WorkImage.defaultProps = {
  position: ImagePosition.inline,
};

export default WorkImage;
