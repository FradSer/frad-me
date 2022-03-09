import classNames from 'classnames';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { captionClass, withCaptionLayoutClass } from '../styles';

interface ITopographyImageProps {
  className?: string;
  src: string;
  alt: string;
  translateX?: string;
  translateY?: string;
  opacity?: number;
}

function TopographyImage(props: ITopographyImageProps) {
  return (
    <motion.div
      whileInView={{
        skewY: -5,
        translateX: props.translateX,
        translateY: props.translateY,
        opacity: props.opacity,
      }}
      transition={{ duration: 1.6, delay: 3.2 }}
      viewport={{ once: true }}
      className={classNames(
        'absolute h-auto w-full border border-gray-200 md:border-2',
        props.className
      )}
    >
      <Image
        src={props.src}
        width={1135}
        height={680}
        layout="responsive"
        alt={props.alt}
      />
    </motion.div>
  );
}

TopographyImage.defaultProps = {
  opacity: 1,
};

function Topography() {
  return (
    <div
      className={classNames('col-span-16 col-start-1', withCaptionLayoutClass)}
    >
      <motion.div
        initial={{ scale: 0.98 }}
        whileInView={{ scale: 0.8 }}
        transition={{ duration: 0.8, delay: 2.4 }}
        className="aspect-[1135/680] w-full"
        viewport={{ once: true }}
      >
        <TopographyImage
          src="/works/bearychat/figure-5.png"
          alt="bearychat-logo"
          opacity={0}
          className="z-50"
        />
        <TopographyImage
          src="/works/bearychat/figure-5-1.png"
          alt="bearychat-logo"
          translateX="-8%"
          translateY="-4%"
        />
        <TopographyImage
          src="/works/bearychat/figure-5-2.png"
          alt="bearychat-logo"
          translateX="0"
          translateY="0"
        />
        <TopographyImage
          src="/works/bearychat/figure-5-3.png"
          alt="bearychat-logo"
          translateX="8%"
          translateY="4%"
        />
      </motion.div>
      <span className={captionClass}>
        BearChat is based with three-column layout topography.
      </span>
    </div>
  );
}

export default Topography;
