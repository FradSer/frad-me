'use client';

import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
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
  const reducedMotion = useReducedMotion();
  const topographyClass = clsx('absolute inset-x-0 top-0 h-auto w-full border-gray-200', {
    'z-50': isTop,
  });

  const opacity = isTop ? 0 : 1;
  const borderWidth = isTop ? '0' : '1px';

  const duration = isTop ? 0.8 : 1.6;

  return (
    <motion.div
      whileInView={
        reducedMotion
          ? undefined
          : {
              skewY: -5,
              translateX: translateX,
              translateY: translateY,
              opacity: opacity,
              borderWidth: borderWidth,
            }
      }
      transition={{
        duration: duration,
        delay: ANIMATION_CONSTANTS.inViewDuration + ANIMATION_CONSTANTS.inViewDelay,
      }}
      viewport={{ once: true }}
      className={topographyClass}
      style={reducedMotion ? { display: isTop ? 'block' : 'none' } : undefined}
    >
      <Image src={src} width={1135} height={680} alt={alt} loading="lazy" />
    </motion.div>
  );
}

function Topography() {
  const reducedMotion = useReducedMotion();
  return (
    <figure className={clsx(COMMON_CLASSES.workComponentLayout, GRID_CLASSES.fullWidth, 'my-4')}>
      <motion.div
        initial={false}
        whileInView={reducedMotion ? undefined : { scale: 0.8 }}
        transition={{
          scale: {
            duration: ANIMATION_CONSTANTS.inViewDuration,
            delay: ANIMATION_CONSTANTS.inViewDelay,
          },
          opacity: { duration: 0.4, ease: 'linear' },
          y: { duration: 0.4, ease: 'linear' },
        }}
        className="relative aspect-[1135/680] w-full"
        viewport={{ once: true }}
      >
        <TopographyImage
          isTop={true}
          src="/works/bearychat/figure-5.png"
          alt="BearyChat workspace before separating its interface layers."
        />
        <TopographyImage
          src="/works/bearychat/figure-5-1.png"
          alt="BearyChat workspace layer showing the primary navigation."
          translateX="-8%"
          translateY="-4%"
        />
        <TopographyImage
          src="/works/bearychat/figure-5-2.png"
          alt="BearyChat workspace layer showing channels and contacts."
          translateX="0"
          translateY="0"
        />
        <TopographyImage
          src="/works/bearychat/figure-5-3.png"
          alt="BearyChat workspace layer showing the conversation, shared links, and composer."
          translateX="8%"
          translateY="4%"
        />
      </motion.div>
      <figcaption className={COMMON_CLASSES.workCaption}>
        BearyChat's three-column layout separates product navigation, channels and contacts, and the
        active conversation.
      </figcaption>
    </figure>
  );
}

export default Topography;
