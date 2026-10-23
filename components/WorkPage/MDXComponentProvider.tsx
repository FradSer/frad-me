'use client';

import { motion } from 'motion/react';

interface IMDXComponentProviderProps {
  children: React.ReactNode;
  className?: string;
}

const VARIANTS = {
  hidden: {
    opacity: 0,
    y: 200,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'linear' as const,
    },
  },
};

function MDXComponentProvider(props: Readonly<IMDXComponentProviderProps>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={VARIANTS}
      viewport={{ once: true }}
      className={props.className}
    >
      {props.children}
    </motion.div>
  );
}

export default MDXComponentProvider;
