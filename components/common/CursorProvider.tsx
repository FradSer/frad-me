import { motion } from 'framer-motion';

import useMouseContext from '../../hooks/useMouseContext';

type ICursorProviderProps = {
  children: React.ReactNode;
};

export default function CursorProvider<T extends ICursorProviderProps>(
  props: T
) {
  // * Hooks
  const mouseContext = useMouseContext();

  // * Reander
  return (
    <motion.div
      onHoverStart={() => {
        mouseContext.cursorChangeHandler('header-link-hovered');
      }}
      onHoverEnd={() => {
        mouseContext.cursorChangeHandler('default');
      }}
    >
      {props.children}
    </motion.div>
  );
}
