import '../styles/globals.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Loading from './components/loading';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url) => {
      url !== router.pathname ? setLoading(true) : setLoading(false);
    };
    const handleComplete = (url) => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router]);

  return (
    <>
      <Loading loading={loading} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
