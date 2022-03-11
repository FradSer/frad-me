import classNames from 'classnames';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { captionClass, withCaptionLayoutClass } from './styles';

type IWorkImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  position: ImagePosition;
};

enum ImagePosition {
  inline = 'inline',
  underH2 = 'underH2',
  fullScreen = 'fullScreen',
}

function WorkImage(props: IWorkImageProps) {
  // * Styling
  const workImageClass = classNames('w-full', {
    'col-span-16 md:col-span-5': props.position === ImagePosition.inline,
    'col-span-16': props.position === ImagePosition.fullScreen,
    'col-span-16 md:col-span-5 mt-0 md:mt-[-3.25rem]':
      props.position === ImagePosition.underH2,
  });

  // * Animation
  const imageVariants = {
    hidden: {
      opacity: 0,
      y: 200,
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
    >
      <div className={withCaptionLayoutClass}>
        <Image
          src={props.src}
          width={props.width}
          height={props.height}
          alt={props.alt}
          loading="eager"
        />
        <span className={captionClass}>{props.alt}</span>
      </div>
    </motion.div>
  );
}

WorkImage.defaultProps = {
  position: ImagePosition.inline,
};

export default WorkImage;
