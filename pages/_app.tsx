import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

import LayoutWrapper from '../components/common/LayoutWrapper';
import DotRing from '../components/Mouse/DotRing';
import MouseContextProvider from '../contexts/Mouse/MouseContextProvider';
import useXRDetect from '../hooks/useXRDetect';

import '../styles/globals.css';

const WebXR = dynamic(() => import('./webxr'), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  // * Hooks
  const xrDetect = useXRDetect();

  // * Render
  return xrDetect.isVR ? (
    <div className="flex h-screen w-screen flex-col">
      <WebXR />
    </div>
  ) : (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <LayoutWrapper>
          <Component {...pageProps} />
        </LayoutWrapper>
      </ThemeProvider>
    </MouseContextProvider>
  );
}

export default MyApp;
