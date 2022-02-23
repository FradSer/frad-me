import { motion, useTransform, useViewportScroll } from 'framer-motion';

export default function WorkTitle() {
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
      className="hover:cursor-defaul col-span-2 px-40 pt-16 text-[7rem] lg:text-[10rem] xl:text-[13rem] 2xl:text-[16rem]"
    >
      work
    </motion.h2>
  );
}
