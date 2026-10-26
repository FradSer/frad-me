'use client';

import { useContext, useEffect, useState } from 'react';
import { CursorType, MouseContext } from '@/contexts/Mouse/MouseContext';
import type { Position } from '@/types/common';
import { type CursorTarget, getMagneticTarget } from '@/utils/motion/cursorGeometry';
import {
  canRetainText,
  getTextTarget,
  TEXT_EXIT_DELAY_MS,
  TEXT_EXIT_DISTANCE,
  type TextCursorTarget,
} from '@/utils/motion/cursorText';

const POINTER_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const CONTROL_SELECTOR =
  'a[href], button, input, textarea, select, [role="button"], [data-cursor="work-card"]';

function isAvailable(element: Element | null): element is Element {
  return (
    !!element?.isConnected &&
    !element.matches(':disabled, [aria-disabled="true"]') &&
    !element.closest('[hidden], [inert]')
  );
}

function workCardCursor(element: Element | null): CursorType | null {
  if (!element?.matches('[data-cursor="work-card"]')) return null;
  const label = element.getAttribute('data-cursor-label');
  if (label === 'READ') return CursorType.workCardHovered;
  if (label === 'WIP') return CursorType.workCardHoveredWIP;
  return null;
}

function readTarget(element: Element | null, point: Position | null): CursorTarget | null {
  if (!point || !isAvailable(element) || element.matches('[data-cursor="work-card"]')) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const isInput = element.matches(
    'textarea, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])',
  );
  return getMagneticTarget(rect, isInput ? 'input' : 'control', point);
}

/** Delegated targeting also covers controls without CursorProvider wrappers. */
export default function useCursorTarget(resetCursor: () => void) {
  const { cursorChangeHandler } = useContext(MouseContext);
  const [target, setTarget] = useState<CursorTarget | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(POINTER_QUERY);
    let element: Element | null = null;
    let pointerElement: Element | null = null;
    let semanticElement: Element | null = null;
    let point: Position | null = null;
    let frame: number | null = null;
    let isInside = false;
    let selectionHeight: number | null = null;
    let retainedText: TextCursorTarget | null = null;
    let textExitTimer: ReturnType<typeof setTimeout> | null = null;
    let textExitExpired = false;
    const cancelTextExit = () => {
      if (textExitTimer !== null) clearTimeout(textExitTimer);
      textExitTimer = null;
      textExitExpired = false;
    };
    const clearText = () => {
      cancelTextExit();
      retainedText = null;
    };
    const resolveText = (next: Element | null, retain: boolean): CursorTarget | null => {
      if (selectionHeight) {
        cancelTextExit();
        return null;
      }
      if (next || !point) {
        clearText();
        return null;
      }
      if (retainedText && !canRetainText(retainedText.element)) clearText();
      const hit = getTextTarget(pointerElement, point, retainedText ? TEXT_EXIT_DISTANCE : 0);
      if (hit) {
        cancelTextExit();
        retainedText = hit;
        return hit.bounds;
      }
      if (retain && retainedText && !textExitExpired && canRetainText(retainedText.element)) {
        if (textExitTimer === null) {
          textExitTimer = setTimeout(() => {
            textExitTimer = null;
            textExitExpired = true;
            if (frame !== null) cancelAnimationFrame(frame);
            refresh(false);
          }, TEXT_EXIT_DELAY_MS);
        }
        return { ...retainedText.bounds, ...point };
      }
      clearText();
      return null;
    };
    const invalidateLayout = () => {
      clearText();
      // A pending pointer frame uses its event target. Layout changes need a
      // fresh hit test even when they arrive before that frame has rendered.
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      scheduleRefresh();
    };
    const resizeObserver = new ResizeObserver(invalidateLayout);
    const updateTarget = (next: Element | null, retain = false, retainText = retain) => {
      const text = resolveText(next, retainText);
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
      clearText();
      selectionHeight = null;
      pointerElement = null;
      semanticElement = null;
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
      pointerElement = underPointer;
      const control = underPointer?.closest(CONTROL_SELECTOR) ?? null;
      const next = isAvailable(control) ? control : null;
      if (next !== semanticElement) resetCursor();
      semanticElement = next;
      const cardCursor = workCardCursor(next);
      if (cardCursor) cursorChangeHandler(cardCursor);
      // Unrelated DOM updates must not cut a pending text exit short.
      updateTarget(next, !resolveUnderPointer, true);
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
      const text = getTextTarget(
        element,
        { x: event.clientX, y: event.clientY },
        retainedText ? TEXT_EXIT_DISTANCE : 0,
      );
      selectionHeight = text?.bounds.height ?? null;
      clearText();
      retainedText = text;
    };
    const endSelection = () => {
      selectionHeight = null;
      scheduleRefresh();
    };
    const cancelSelection = () => {
      clearText();
      endSelection();
    };
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'inert', 'data-cursor-label'],
    });
    const themeObserver = new MutationObserver(invalidateLayout);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', startSelection, { passive: true });
    document.addEventListener('pointerup', endSelection, { passive: true });
    document.addEventListener('pointercancel', cancelSelection, { passive: true });
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', invalidateLayout, true);
    window.addEventListener('resize', invalidateLayout);
    media.addEventListener('change', hide);
    return () => {
      clearText();
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', move);
      document.removeEventListener('pointerleave', hide);
      document.removeEventListener('pointerdown', startSelection);
      document.removeEventListener('pointerup', endSelection);
      document.removeEventListener('pointercancel', cancelSelection);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', invalidateLayout, true);
      window.removeEventListener('resize', invalidateLayout);
      media.removeEventListener('change', hide);
      document.documentElement.removeAttribute('data-custom-cursor');
    };
  }, [resetCursor, cursorChangeHandler]);

  return { target, visible };
}
