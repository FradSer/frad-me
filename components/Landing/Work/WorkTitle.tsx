import { motion, useTransform, useScroll } from 'motion/react';

export default function WorkTitle() {
  const { scrollYProgress } = useScroll();

  const offsetY = useTransform(scrollYProgress, [0.3, 0.6], [-100, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.25, 1]);

  return (
    <motion.h2
      style={{
        y: offsetY,
        scale: scale,
        scrollMarginLeft: '0',
      }}
      className="col-span-2 px-0 pt-16 text-center text-[7rem] hover:cursor-default sm:px-40 lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]"
    >
      work
    </motion.h2>
  );
}
