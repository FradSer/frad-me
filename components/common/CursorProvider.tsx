'use client';

import { motion } from 'motion/react';
import { CursorType } from '@/contexts/Mouse/MouseContext';
import useMouseContext from '@/hooks/useMouseContext';

type ICursorProviderProps = {
  children: React.ReactNode;
  targetCursorType: CursorType;
};

function CursorProvider<T extends ICursorProviderProps>(props: Readonly<T>) {
  // * Hooks
  const mouseContext = useMouseContext();

  // * Render
  return (
    <motion.div
      onHoverStart={() => {
        mouseContext.cursorChangeHandler(props.targetCursorType);
      }}
      onHoverEnd={() => {
        mouseContext.cursorChangeHandler(CursorType.default);
      }}
    >
      {props.children}
    </motion.div>
  );
}

export { CursorProvider, CursorType };
