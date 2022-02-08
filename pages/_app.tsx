import '../styles/globals.css';

import { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { ThemeProvider } from 'next-themes';

import MouseContextProvider from '../contexts/Mouse/MouseContextProvider';

import Loading from './loading';

import DotRing from '../components/Mouse/DotRing';

const WebXR = dynamic(() => import('./webxr'), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      url !== router.pathname ? setLoading(true) : setLoading(false);
    };
    const handleComplete = (url: string) => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router]);

  return (
    <MouseContextProvider>
      <ThemeProvider forcedTheme={undefined} attribute="class">
        <DotRing />
        <WebXR />
        <Loading loading={loading} />
        <Component {...pageProps} />
      </ThemeProvider>
    </MouseContextProvider>
  );
}

export default MyApp;
