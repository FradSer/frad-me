import type { Position } from '@/types/common';
import type { CursorTarget } from '@/utils/motion/cursorGeometry';

const EXCLUDED =
  'a[href], button, input, textarea, select, [role="button"], [data-cursor="work-card"], [hidden], [inert]';

function caretRange(point: Position): Range | null {
  const caret = document.caretPositionFromPoint?.(point.x, point.y);
  if (!caret) return document.caretRangeFromPoint?.(point.x, point.y) ?? null;
  const range = document.createRange();
  range.setStart(caret.offsetNode, caret.offset);
  range.collapse(true);
  return range;
}

function canSelect(element: Element): boolean {
  for (let parent: Element | null = element; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none' || style.userSelect === 'none')
      return false;
    if (style.userSelect === 'text' || style.userSelect === 'all') return true;
  }
  return true;
}

/** Measure adjacent glyphs so paragraph padding never becomes a text target. */
export function getTextTarget(
  element: Element | null,
  point: Position | null,
): CursorTarget | null {
  if (!point || !element?.isConnected || element.closest(EXCLUDED)) return null;
  const range = caretRange(point);
  const node = range?.startContainer;
  const parent = node?.parentElement;
  if (!range || node?.nodeType !== Node.TEXT_NODE || !parent || !element.contains(node))
    return null;
  if (parent.closest(EXCLUDED) || !canSelect(parent)) return null;

  for (const offset of [range.startOffset - 1, range.startOffset]) {
    if (offset < 0 || offset >= (node.textContent?.length ?? 0)) continue;
    const glyph = range.cloneRange();
    glyph.setStart(node, offset);
    glyph.setEnd(node, offset + 1);
    for (const rect of glyph.getClientRects()) {
      if (
        rect.width > 0 &&
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      )
        return { ...point, width: 2, height: Math.max(12, rect.height), kind: 'text', grip: 0 };
    }
  }
  return null;
}
