import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import LayoutWrapper from '../components/common/LayoutWrapper';
import Loading from '../components/common/Loading';
import Header from '../components/Header';
import DotRing from '../components/Mouse/DotRing';
import MouseContextProvider from '../contexts/Mouse/MouseContextProvider';
import useXRDetect from '../hooks/useXRDetect';
import Footer from '../components/Footer';

import '../styles/globals.css';

const WebXR = dynamic(() => import('./webxr'), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  // * Hooks
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const xrDetect = useXRDetect();

  useEffect(() => {
    const handleStart = (url: string) => {
      url !== router.pathname ? setLoading(true) : setLoading(false);
    };
    const handleComplete = (url: string) => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router]);

  // * Render
  // TODO: Add loading animation
  return xrDetect.isVR ? (
    <WebXR />
  ) : (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <LayoutWrapper>
          <Header />
          <Component {...pageProps} />
        </LayoutWrapper>
      </ThemeProvider>
    </MouseContextProvider>
  );
}

export default MyApp;
