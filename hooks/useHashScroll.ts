'use client';

import { useEffect } from 'react';

/**
 * Scroll to the DOM element that matches `window.location.hash`.
 * Uses requestAnimationFrame to wait one paint so the target
 * element is in the layout.
 */
function scrollToHash(): void {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  requestAnimationFrame(() => {
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    }
  });
}

/**
 * Hook that scrolls to the element matching the URL hash.
 *
 * This is necessary because Next.js client-side navigation to /#hash
 * doesn't automatically scroll to the target element.
 */
export default function useHashScroll(): void {
  useEffect(() => {
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);
}
