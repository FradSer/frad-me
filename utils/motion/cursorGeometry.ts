import type { Position } from '@/types/common';

export const CURSOR_DOT_SIZE = 16;
export const CURSOR_RELEASE_DISTANCE = 48;

export type CursorTarget = Position & {
  width: number;
  height: number;
  kind: 'control' | 'input';
  grip: number;
};

type TargetBounds = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height'>;

/** Keep a spatial tether until the pointer pulls clear of the target. */
export function getMagneticTarget(
  rect: TargetBounds,
  kind: CursorTarget['kind'],
  point: Position,
): CursorTarget | null {
  const dx = Math.max(rect.left - point.x, 0, point.x - rect.right);
  const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom);
  const distance = Math.hypot(dx, dy);
  if (distance >= CURSOR_RELEASE_DISTANCE) return null;

  const progress = distance / CURSOR_RELEASE_DISTANCE;
  const grip = 1 - progress * progress * (3 - 2 * progress);
  const width = kind === 'input' ? rect.width : rect.width + 8;
  const height = kind === 'input' ? 2 : rect.height + 8;
  const x = rect.left + rect.width / 2;
  const y = kind === 'input' ? rect.bottom + 2 : rect.top + rect.height / 2;

  return {
    x: point.x + (x - point.x) * grip,
    y: point.y + (y - point.y) * grip,
    width: CURSOR_DOT_SIZE + (width - CURSOR_DOT_SIZE) * grip,
    height: CURSOR_DOT_SIZE + (height - CURSOR_DOT_SIZE) * grip,
    kind,
    grip,
  };
}
