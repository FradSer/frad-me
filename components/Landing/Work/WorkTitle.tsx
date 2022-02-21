import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function WorkTitle() {
  const ref = useRef(null);
  const { scrollYProgress } = useViewportScroll();

  const offsetY = useTransform(scrollYProgress, [0.3, 0.6], [-100, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.25, 1]);

  return (
    <motion.h2
      style={{
        y: offsetY,
        scale: scale,
        scrollMarginLeft: '0',
      }}
      className="px-40 col-span-2 pt-16 text-[7rem] lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem] hover:cursor-defaul"
    >
      work
    </motion.h2>
  );
}
