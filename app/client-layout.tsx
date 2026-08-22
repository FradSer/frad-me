'use client';

import { usePathname } from 'next/navigation';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import DotRing from '@/components/Mouse/DotRing';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';
import { WebMCPProvider } from '@/contexts/WebMCP/WebMCPContext';

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Keeps the root client boundary request-aware so routes with runtime
  // metadata (e.g. /works/[slug]) stream it instead of failing prerender
  // validation under Cache Components.
  usePathname();

  return (
    <ErrorBoundary componentName="StandardLayout">
      <WebMCPProvider>
        <MouseContextProvider>
          <ThemeModeProvider>
            <DotRing />
            <LayoutWrapper>{children}</LayoutWrapper>
          </ThemeModeProvider>
        </MouseContextProvider>
      </WebMCPProvider>
    </ErrorBoundary>
  );
}
