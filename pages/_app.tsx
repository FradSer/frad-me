import '../styles/globals.css';

import { useState, useEffect } from 'react';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import classNames from 'classnames';

import { ThemeProvider } from 'next-themes';

import useXRDetect from '../hooks/useXRDetect';
import MouseContextProvider from '../contexts/Mouse/MouseContextProvider';

import Loading from './loading';

import DotRing from '../components/Mouse/DotRing';

const WebXR = dynamic(() => import('../components/WebXR'), { ssr: false });

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
  return xrDetect.isXR ? (
    <div className="h-screen w-screen">
      <WebXR />
    </div>
  ) : (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <Loading loading={loading} />
        <Component {...pageProps} />
      </ThemeProvider>
    </MouseContextProvider>
  );
}

export default MyApp;
