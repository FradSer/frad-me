import React from 'react';

import {
  motion,
  useTransform,
  useMotionValue,
  useAnimation,
} from 'framer-motion';

// https://github.com/brunob/leaflet.fullscreen/issues/52

export default function Rectangle() {
  const [angle, setAngle] = React.useState(2);
  const [perspective, setPerspective] = React.useState(500);

  // we replace the useState with two motion values. One for each axis.
  // Since we want the card to start out flat we set the initial
  // values to x=0.5 y=0.5 which equals to no transformation
  const y = useMotionValue(0.5);
  const x = useMotionValue(0.5);

  const skewX = useTransform(y, [0, 1], [angle, -angle], {
    clamp: true,
  });
  const skewY = useTransform(x, [0, 1], [-angle, angle], {
    clamp: true,
  });

  const onMove = (e: any) => {
    // get position information for the card
    const bounds = e.currentTarget.getBoundingClientRect();

    // set x,y local coordinates
    const xValue = (e.clientX - bounds.x) / e.currentTarget.clientWidth;
    const yValue = (e.clientY - bounds.y) / e.currentTarget.clientHeight;

    // update MotionValues
    x.set(xValue, true);
    y.set(yValue, true);
  };

  return (
    <div className="flex grow ml-2 lg:ml-8">
      <motion.div
        className="bg-black dark:bg-white w-full h-full"
        style={{
          skewX: skewX,
          skewY: skewY,
        }}
      ></motion.div>
      <motion.div
        onPointerMove={onMove}
        className="absolute w-screen h-screen inset-0 z-10"
      ></motion.div>
    </div>
  );
}
