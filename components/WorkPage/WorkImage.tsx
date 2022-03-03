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
  const workImageClass = classNames({
    'col-span-16 mt-0 h-32 bg-black md:col-span-5':
      position === ImagePosition.inline,
    'col-span-16 w-full h-screen bg-black':
      position === ImagePosition.fullScreen,
    'col-span-16 mt-0 h-32 bg-black md:col-span-5 md:mt-[-3.25rem]':
      position === ImagePosition.underH2,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: '38%' }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          delay: 0.2,
          ease: 'easeIn',
        },
      }}
      viewport={{ once: true }}
      className={workImageClass}
    ></motion.div>
  );
}

WorkImage.defaultProps = {
  position: ImagePosition.inline,
};

export default WorkImage;
