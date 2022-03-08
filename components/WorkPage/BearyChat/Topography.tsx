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
      transition={{ duration: 1.6, delay: 1.6 }}
      className={classNames(
        'absolute h-full w-full border-2 border-gray-100',
        props.className
      )}
    >
      <Image src={props.src} width={1135} height={680} alt={props.alt} />
    </motion.div>
  );
}

TopographyImage.defaultProps = {
  opacity: 1,
};

function Topography() {
  return (
    <div
      className={classNames(
        'col-span-16 col-start-1 h-full w-full',
        withCaptionLayoutClass
      )}
    >
      <motion.div
        whileInView={{ scale: 0.8 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        style={{
          width: 1135,
          height: 680,
        }}
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
          translateX="-5%"
          translateY="-5%"
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
          translateX="5%"
          translateY="5%"
        />
      </motion.div>
      <span className={captionClass}>
        BearChat is based with three-column layout topography.
      </span>
    </div>
  );
}

export default Topography;
