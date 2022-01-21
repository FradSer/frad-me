import '../styles/globals.css';

import { useState, useEffect } from 'react';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import DotRing from './components/dot-ring';
import Loading from './components/loading';

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
    <>
      <DotRing />
      <Loading loading={loading} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
