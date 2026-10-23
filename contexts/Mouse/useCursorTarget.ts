'use client';

import { useEffect, useState } from 'react';
import type { Position } from '@/types/common';
import { type CursorTarget, getMagneticTarget } from '@/utils/motion/cursorGeometry';
import { getTextTarget } from '@/utils/motion/cursorText';

const POINTER_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CONTROL_SELECTOR =
  'a[href], button, input, textarea, select, [role="button"], [data-cursor="work-card"]';

function readTarget(element: Element | null, point: Position | null): CursorTarget | null {
  if (
    !point ||
    !element?.isConnected ||
    element.matches(':disabled, [aria-disabled="true"], [data-cursor="work-card"]') ||
    element.closest('[hidden], [inert]')
  )
    return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const isInput = element.matches(
    'textarea, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])',
  );
  return getMagneticTarget(rect, isInput ? 'input' : 'control', point);
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
    let selectionHeight: number | null = null;
    const resizeObserver = new ResizeObserver(() => scheduleRefresh());
    const updateTarget = (next: Element | null, retain = false) => {
      const text = next || selectionHeight ? null : getTextTarget(pointerElement, point);
      const candidate = next ?? (retain && !text ? element : null);
      const bounds: CursorTarget | null =
        selectionHeight && point
          ? { ...point, width: 2, height: selectionHeight, kind: 'text', grip: 0 }
          : (text ?? readTarget(candidate, point));
      const validElement = bounds && bounds.kind !== 'text' ? candidate : null;
      if (element !== validElement) {
        resizeObserver.disconnect();
        element = validElement;
        if (element) resizeObserver.observe(element);
      }
      setTarget((previous) =>
        JSON.stringify(previous) === JSON.stringify(bounds) ? previous : bounds,
      );
    };
    const hide = () => {
      isInside = false;
      selectionHeight = null;
      pointerElement = null;
      point = null;
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
      updateTarget(underPointer?.closest(CONTROL_SELECTOR) ?? null, !resolveUnderPointer);
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
    const startSelection = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        !media.matches ||
        (event.pointerType && event.pointerType !== 'mouse')
      )
        return;
      const element = event.target instanceof Element ? event.target : null;
      const text = getTextTarget(element, { x: event.clientX, y: event.clientY });
      selectionHeight = text?.height ?? null;
    };
    const endSelection = () => {
      selectionHeight = null;
      scheduleRefresh();
    };
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'inert'],
    });
    const themeObserver = new MutationObserver(scheduleRefresh);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', startSelection, { passive: true });
    document.addEventListener('pointerup', endSelection, { passive: true });
    document.addEventListener('pointercancel', endSelection, { passive: true });
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
      document.removeEventListener('pointerdown', startSelection);
      document.removeEventListener('pointerup', endSelection);
      document.removeEventListener('pointercancel', endSelection);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', scheduleRefresh, true);
      window.removeEventListener('resize', scheduleRefresh);
      media.removeEventListener('change', hide);
      document.documentElement.removeAttribute('data-custom-cursor');
    };
  }, [resetCursor]);

  return { target, visible };
}
