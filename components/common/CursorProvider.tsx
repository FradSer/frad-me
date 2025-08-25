import { motion } from 'framer-motion';

import useMouseContext from '@/hooks/useMouseContext';

type ICursorProviderProps = {
  children: React.ReactNode;
  targetCursorType: CursorType;
};

enum CursorType {
  default = 'default',
  headerLinkHovered = 'header-link-hovered',
  workCardHovered = 'work-card-hovered',
  workCardHoveredWIP = 'work-card-hovered-wip',
  attracted = 'attracted',
}

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
