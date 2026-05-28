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
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/**
 * Hook that scrolls to the element matching the URL hash after the page
 * has fully rendered.
 *
 * This is necessary because:
 * 1. The initial loading screen (useLoading) delays DOM insertion of
 *    section elements, so the browser's native hash scroll fires too early.
 * 2. Next.js client-side navigation to /#hash doesn't automatically
 *    scroll to the target element.
 *
 * @param isReady - Pass `true` once the page content is mounted
 *                  (i.e. loading is complete).
 */
export default function useHashScroll(isReady: boolean): void {
  // Handle hash present on initial load / when isReady flips to true
  useEffect(() => {
    if (!isReady) return;
    scrollToHash();
  }, [isReady]);

  // Handle subsequent hash changes (e.g. client-side navigation from
  // another page to /#section via Next.js <Link>)
  useEffect(() => {
    if (!isReady) return;

    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [isReady]);
}
