'use client';

import { motion, useTransform, useScroll } from 'motion/react';
import { useRef } from 'react';

export default function WorkTitle() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const offsetY = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.25, 1]);

  return (
    <motion.h2
      ref={ref}
      style={{
        y: offsetY,
        scale: scale,
        scrollMarginLeft: '0',
      }}
      className="col-span-2 px-0 pt-24 pb-20 text-center text-[7rem] hover:cursor-default sm:px-40 lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]"
    >
      work
    </motion.h2>
  );
}
