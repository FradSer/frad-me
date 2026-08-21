'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import DotRing from '@/components/Mouse/DotRing';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';
import { WebMCPProvider } from '@/contexts/WebMCP/WebMCPContext';
import useXRDetect from '@/hooks/useXRDetect';

const WebXR = dynamic(() => import('./webxr/page'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-2xl font-bold text-white">Loading XR...</div>
    </div>
  ),
});

type ClientLayoutProps = {
  children: React.ReactNode;
};

const StandardLayout = ({ children }: ClientLayoutProps) => (
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

const VRLayout = () => (
  <ErrorBoundary componentName="VRLayout">
    <div className="flex h-screen w-screen flex-col bg-black">
      <WebXR />
    </div>
  </ErrorBoundary>
);

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isVR, isLoading } = useXRDetect();

  // /webxr has its own page — render the immersive layout without the standard chrome.
  // This branch only matches the /webxr route, so "/" is never dropped.
  if (pathname === '/webxr') {
    return <VRLayout />;
  }

  // XR detection is client-only and async. To keep "/" instantly navigable
  // under `cacheComponents`, we must not drop `children` while detection is
  // in-flight or when the check hasn't completed. Render the standard layout
  // immediately and only switch to VR once detection has settled to true.
  if (!isLoading && isVR) {
    return <VRLayout />;
  }

  return <StandardLayout>{children}</StandardLayout>;
}
