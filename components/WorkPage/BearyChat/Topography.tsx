import { clsx } from 'clsx';
import { motion } from 'motion/react';
import Image from 'next/image';

import { ANIMATION_CONSTANTS, COMMON_CLASSES, GRID_CLASSES } from '@/utils/constants';

interface ITopographyImageProps {
  isTop?: boolean;
  src: string;
  alt: string;
  translateX?: string;
  translateY?: string;
}

function TopographyImage({
  isTop = false,
  src,
  alt,
  translateX,
  translateY,
}: Readonly<ITopographyImageProps>) {
  const topographyClass = clsx('absolute h-auto w-full border-gray-200', {
    'z-50': isTop,
  });

  const opacity = isTop ? 0 : 1;
  const borderWidth = isTop ? '0' : '1px';

  const duration = isTop ? 0.8 : 1.6;

  return (
    <motion.div
      whileInView={{
        skewY: -5,
        translateX: translateX,
        translateY: translateY,
        opacity: opacity,
        borderWidth: borderWidth,
      }}
      transition={{
        duration: duration,
        delay: ANIMATION_CONSTANTS.inViewDuration + ANIMATION_CONSTANTS.inViewDelay,
      }}
      viewport={{ once: true }}
      className={topographyClass}
    >
      <Image src={src} width={1135} height={680} alt={alt} loading="lazy" />
    </motion.div>
  );
}

function Topography() {
  return (
    <div className={clsx(COMMON_CLASSES.workComponentLayout, GRID_CLASSES.contentWrapper)}>
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 200 }}
        whileInView={{ scale: 0.8, opacity: 1, y: 0 }}
        transition={{
          scale: {
            duration: ANIMATION_CONSTANTS.inViewDuration,
            delay: ANIMATION_CONSTANTS.inViewDelay,
          },
          opacity: { duration: 0.4, ease: 'linear' },
          y: { duration: 0.4, ease: 'linear' },
        }}
        className="aspect-[1135/680] w-full"
        viewport={{ once: true }}
      >
        <TopographyImage isTop={true} src="/works/bearychat/figure-5.png" alt="bearychat-logo" />
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
      <span className={COMMON_CLASSES.workCaption}>
        BearChat is based with three-column layout topography.
      </span>
    </div>
  );
}

export default Topography;
