import type { Position, Size } from '@/types/common';

const DEFAULT_SKEW_ANGLE = 2;

export function calculateSkew(
  mousePos: Position,
  windowSize: Size,
  angle: number = DEFAULT_SKEW_ANGLE,
) {
  const xValue = mousePos.x / windowSize.width;
  const yValue = mousePos.y / windowSize.height;

  return {
    skewX: xValue * angle * 2 - angle,
    skewY: yValue * -angle * 2 + angle,
    xValue,
    yValue,
  };
}
