'use client';

import { useEffect, useState } from 'react';
import type { Position } from '@/types/common';

export type CursorTarget = Position & {
  width: number;
  height: number;
  radius: number;
  kind: 'control' | 'input';
};

const POINTER_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CONTROL_SELECTOR = 'a[href], button, input, textarea, select, [role="button"]';

function readTarget(element: Element | null): CursorTarget | null {
  if (!element?.isConnected || element.matches(':disabled, [aria-disabled="true"]')) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const isInput = element.matches(
    'textarea, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])',
  );
  if (isInput) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 2,
      width: rect.width,
      height: 2,
      radius: 1,
      kind: 'input',
    };
  }
  const radius = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width + 8,
    height: rect.height + 8,
    radius: radius ? radius + 4 : element.matches('a') ? (rect.height + 8) / 2 : 8,
    kind: 'control',
  };
}

/** Delegated targeting also covers controls without CursorProvider wrappers. */
export default function useCursorTarget(resetCursor: () => void) {
  const [target, setTarget] = useState<CursorTarget | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(POINTER_QUERY);
    let element: Element | null = null;
    let pointerElement: Element | null = null;
    let point: Position | null = null;
    let frame: number | null = null;
    let isInside = false;
    const resizeObserver = new ResizeObserver(() => scheduleRefresh());
    const updateTarget = (next: Element | null) => {
      if (element !== next) {
        resizeObserver.disconnect();
        element = next;
        if (element) resizeObserver.observe(element);
      }
      const bounds = readTarget(element);
      setTarget((previous) =>
        JSON.stringify(previous) === JSON.stringify(bounds) ? previous : bounds,
      );
    };
    const hide = () => {
      isInside = false;
      setVisible(false);
      updateTarget(null);
      document.documentElement.removeAttribute('data-custom-cursor');
      resetCursor();
    };
    const refresh = (resolveUnderPointer = true) => {
      frame = null;
      if (!media.matches || !isInside || !point) return hide();
      if (pointerElement && !pointerElement.isConnected) {
        pointerElement = null;
        resetCursor();
      }
      const underPointer =
        resolveUnderPointer && document.elementFromPoint
          ? document.elementFromPoint(point.x, point.y)
          : pointerElement;
      if (resolveUnderPointer && underPointer !== pointerElement) resetCursor();
      pointerElement = underPointer;
      updateTarget(underPointer?.closest(CONTROL_SELECTOR) ?? null);
    };
    function scheduleRefresh() {
      if (frame === null) frame = requestAnimationFrame(() => refresh());
    }
    const move = (event: PointerEvent) => {
      if (!media.matches || (event.pointerType && event.pointerType !== 'mouse')) return hide();
      point = { x: event.clientX, y: event.clientY };
      pointerElement = event.target instanceof Element ? event.target : null;
      isInside = true;
      setVisible(true);
      document.documentElement.setAttribute('data-custom-cursor', '');
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => refresh(false));
    };
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, { childList: true, subtree: true });
    const themeObserver = new MutationObserver(scheduleRefresh);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', scheduleRefresh, true);
    window.addEventListener('resize', scheduleRefresh);
    media.addEventListener('change', hide);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', scheduleRefresh, true);
      window.removeEventListener('resize', scheduleRefresh);
      media.removeEventListener('change', hide);
      document.documentElement.removeAttribute('data-custom-cursor');
    };
  }, [resetCursor]);

  return { target, visible };
}
