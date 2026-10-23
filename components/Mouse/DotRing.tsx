'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect } from 'react';

import { CursorType } from '@/contexts/Mouse/MouseContext';
import useCursorTarget from '@/contexts/Mouse/useCursorTarget';
import useMouseContext from '@/hooks/useMouseContext';
import useMousePosition from '@/hooks/useMousePosition';
import { calculateBlendPosition } from '@/utils/motion/animationHelpers';

const SPRING_CONFIG = { stiffness: 300, damping: 30 } as const;
const MORPH_TRANSITION = { type: 'spring', ...SPRING_CONFIG } as const;
const CURSOR_SIZE = 64;

// A fixed command sequence lets one visible path interpolate between all shapes.
function roundedShape(width: number, height: number, radius: number): string {
  const left = (CURSOR_SIZE - width) / 2;
  const top = (CURSOR_SIZE - height) / 2;
  const right = left + width;
  const bottom = top + height;
  const r = Math.min(radius, width / 2, height / 2);
  return `M ${left + r} ${top} L ${right - r} ${top} A ${r} ${r} 0 0 1 ${right} ${top + r} L ${right} ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom} L ${left + r} ${bottom} A ${r} ${r} 0 0 1 ${left} ${bottom - r} L ${left} ${top + r} A ${r} ${r} 0 0 1 ${left + r} ${top} Z`;
}

export default function DotRing() {
  const mousePosition = useMousePosition();
  const { cursorType, attractorPosition, cursorChangeHandler } = useMouseContext();
  const resetCursor = useCallback(
    () => cursorChangeHandler(CursorType.default),
    [cursorChangeHandler],
  );
  const { target, visible } = useCursorTarget(resetCursor);
  const attractedX = useMotionValue(0);
  const attractedY = useMotionValue(0);
  const springX = useSpring(attractedX, SPRING_CONFIG);
  const springY = useSpring(attractedY, SPRING_CONFIG);
  const isWorkCard =
    cursorType === CursorType.workCardHovered || cursorType === CursorType.workCardHoveredWIP;
  const activeTarget = isWorkCard ? null : target;
  const size = isWorkCard ? 64 : 16;
  const shape = roundedShape(
    activeTarget?.width ?? size,
    activeTarget?.height ?? size,
    activeTarget?.radius ?? size / 2,
  );

  useEffect(() => {
    const position = activeTarget ?? calculateBlendPosition(mousePosition, attractorPosition, 0.7);
    attractedX.set(position.x - CURSOR_SIZE / 2);
    attractedY.set(position.y - CURSOR_SIZE / 2);
  }, [mousePosition, attractorPosition, activeTarget, attractedX, attractedY]);

  const positionStyle = { x: springX, y: springY };
  return (
    <>
      <style>{`@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
        html[data-custom-cursor], html[data-custom-cursor] * { cursor: none !important; }
      }`}</style>
      <motion.svg
        aria-hidden="true"
        width={CURSOR_SIZE}
        height={CURSOR_SIZE}
        className="fixed top-0 left-0 pointer-events-none z-60 overflow-visible"
        style={{
          ...positionStyle,
          display: visible ? 'block' : 'none',
          mixBlendMode: isWorkCard ? 'normal' : 'difference',
        }}
      >
        <motion.path
          data-cursor-shape={isWorkCard ? 'work-card' : (activeTarget?.kind ?? 'dot')}
          data-cursor-width={activeTarget?.width ?? size}
          data-cursor-height={activeTarget?.height ?? size}
          initial={{ d: roundedShape(16, 16, 8) }}
          animate={{ d: shape }}
          transition={MORPH_TRANSITION}
          fill="white"
        />
      </motion.svg>
      {isWorkCard && visible && (
        <motion.div
          aria-hidden="true"
          className="fixed top-0 left-0 w-16 h-16 flex items-center justify-center pointer-events-none z-70 text-black font-bold text-xl"
          style={positionStyle}
        >
          {cursorType === CursorType.workCardHoveredWIP ? 'WIP' : 'READ'}
        </motion.div>
      )}
    </>
  );
}
