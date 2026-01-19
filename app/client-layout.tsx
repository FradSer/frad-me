'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import LayoutWrapper from '@/components/common/LayoutWrapper';
import DotRing from '@/components/Mouse/DotRing';
import MouseContextProvider from '@/contexts/Mouse/MouseContextProvider';
import ThemeModeProvider from '@/contexts/Theme/ThemeModeProvider';
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
    <MouseContextProvider>
      <ThemeModeProvider>
        <DotRing />
        <LayoutWrapper>{children}</LayoutWrapper>
      </ThemeModeProvider>
    </MouseContextProvider>
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

  // If user is explicitly on /webxr route, render VR layout directly
  if (pathname === '/webxr') {
    return <VRLayout />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-2xl font-bold text-white">Detecting XR capabilities...</div>
      </div>
    );
  }

  return isVR ? <VRLayout /> : <StandardLayout>{children}</StandardLayout>;
}
