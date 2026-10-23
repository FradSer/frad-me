'use client';

import { useEffect } from 'react';

/** Wait for hash targets, including sections loaded by client-only islands. */
function watchHashTarget(): () => void {
  const hash = window.location.hash.slice(1);
  if (!hash) return () => {};
  let frame: number | null = null;
  let active = true;
  const observer = new MutationObserver(schedule);
  const cancel = () => {
    active = false;
    observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  };
  function schedule(): void {
    if (!active || frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (!active) return;
      const element = document.getElementById(hash);
      if (!element) return;
      cancel();
      element.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    });
  }
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['id'],
  });
  schedule();
  return cancel;
}

/** Follow hash changes and cancel stale observers and frames on navigation. */
export default function useHashScroll(): void {
  useEffect(() => {
    let cancel = () => {};
    const navigate = () => {
      cancel();
      cancel = watchHashTarget();
    };
    navigate();
    window.addEventListener('hashchange', navigate);
    return () => {
      cancel();
      window.removeEventListener('hashchange', navigate);
    };
  }, []);
}
