import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';

import useMousePosition from '../../../hooks/useMousePosition';
import useWindowSize from '../../../hooks/useWindowSize';

// https://github.com/brunob/leaflet.fullscreen/issues/52

export default function Rectangle() {
  // * Hooks
  const mousePosition = useMousePosition();
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
  const xValue = mousePosition.x / size.width;
  const yValue = mousePosition.y / size.height;

  // update MotionValues
  mouseX.set(xValue, true);
  mouseY.set(yValue, true);

  // * Render
  return (
    <div className="ml-2 flex grow lg:ml-8">
      <motion.div
        className="h-full w-full bg-black dark:bg-white"
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
      ></motion.div>
    </div>
  );
}
