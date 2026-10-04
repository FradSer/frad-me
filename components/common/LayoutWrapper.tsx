'use client';

import type { ReactNode } from 'react';

import Header from '@/components/Header';

import useHashScroll from '@/hooks/useHashScroll';

type LayoutWrapperProps = {
  children: ReactNode;
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  // Scroll to #hash targets after mount; client-side navigations to /#section
  // don't trigger the browser's native hash scroll.
  useHashScroll();

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-white dark:bg-black">
      {/* === STATUS BAR COVER ===
          Solid status bar cover for iOS safe area.
          black-translucent + viewport-fit=cover lets content extend behind the bar;
          this div covers that zone with an opaque solid color. */}
      <div className="fixed inset-x-0 top-0 h-[env(safe-area-inset-top)] pointer-events-none z-[60] bg-white dark:bg-black" />

      {/* === DESKTOP HEADER BLUR (hidden with mobile navigation) ===
          Must live here (outside header) because transform-based animations break
          backdrop-filter on position:fixed children in Safari. */}
      <div
        className="hidden md:block fixed inset-x-0 top-0 h-[calc(6rem+env(safe-area-inset-top))] backdrop-blur-lg pointer-events-none z-40 dark:!hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
        }}
      />
      <div
        className="hidden md:dark:block fixed inset-x-0 top-0 h-[calc(6rem+env(safe-area-inset-top))] backdrop-blur-lg pointer-events-none z-40"
        style={{
          background: 'rgba(0,0,0,0.08)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)',
        }}
      />

      {/* One glass surface grows with the menu, avoiding nested blur layers. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-8 bg-white/80 dark:bg-black/80 backdrop-blur-lg md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none">
        <div className="layout-wrapper pointer-events-auto mx-auto">
          <Header />
        </div>
      </header>

      <main className="flex w-full flex-col items-center justify-center bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
}
