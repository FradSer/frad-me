import { motion } from 'framer-motion';

import useMousePosition from '../hooks/useMousePosition';

export default function DotRing() {
  const { x, y } = useMousePosition();
  return (
    <>
      <div
        className="fixed top-0 left-0 w-5 h-5 duration-100 pointer-events-none"
        style={{ left: `${x}px`, top: `${y}px` }}
      ></div>
      <div
        className="fixed mix-blend-difference w-6 h-6 rounded-full bg-white pointer-events-none z-50"
        style={{ left: `${x}px`, top: `${y}px` }}
      ></div>
    </>
  );
}
