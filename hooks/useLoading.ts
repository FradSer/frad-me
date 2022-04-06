import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Loading = {
  isLoading: boolean;
};

function useLoading(): Loading {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router]);

  return { isLoading };
}

export default useLoading;
