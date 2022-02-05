import { useState } from 'react';

import useMousePosition from '../../hooks/useMousePosition';
import useWindowSize from '../../hooks/useWindowSize';

import { motion, useTransform, useMotionValue } from 'framer-motion';

// https://github.com/brunob/leaflet.fullscreen/issues/52

export default function Rectangle() {
  // * Hooks
  const { x, y } = useMousePosition();
  const size = useWindowSize();

  // * Animation
  const [angle, setAngle] = useState(2);
  const [perspective, setPerspective] = useState(500);

  // we replace the useState with two motion values. One for each axis.
  // Since we want the card to start out flat we set the initial
  // values to x=0.5 y=0.5 which equals to no transformation
  const mouseY = useMotionValue(0.5);
  const mouseX = useMotionValue(0.5);

  const skewX = useTransform(mouseX, [0, 1], [angle, -angle], {
    clamp: true,
  });
  const skewY = useTransform(mouseY, [0, 1], [-angle, angle], {
    clamp: true,
  });

  // set x,y local coordinates
  const xValue = x / size.width;
  const yValue = y / size.height;

  // update MotionValues
  mouseX.set(xValue, true);
  mouseY.set(yValue, true);

  // * Render
  return (
    <div className="flex grow ml-2 lg:ml-8">
      <motion.div
        className="bg-black dark:bg-white w-full h-full"
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
      ></motion.div>
    </div>
  );
}
