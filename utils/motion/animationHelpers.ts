import type { Position } from '@/types/common';

const DEFAULT_BLEND_FACTOR = 0.7;

const lerp = (start: number, end: number, factor: number): number => start + (end - start) * factor;

const lerpPosition = (start: Position, end: Position, factor: number): Position => ({
  x: lerp(start.x, end.x, factor),
  y: lerp(start.y, end.y, factor),
});

export function calculateBlendPosition(
  mousePos: Position,
  attractorPos: Position | null,
  blendFactor = DEFAULT_BLEND_FACTOR,
): Position {
  if (!attractorPos) return mousePos;
  return lerpPosition(mousePos, attractorPos, blendFactor);
}
