import { useEffect, useState, useTransition } from 'react'

type UseLoadingReturn = {
  isLoading: boolean
  startTransition: (callback: () => void) => void
}

/**
 * Hook for managing loading states in App Router
 * Uses React's useTransition for better UX during navigation
 */
export default function useLoading(): UseLoadingReturn {
  const [isPending, startTransition] = useTransition()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Reset initial loading state after first render
    setIsInitialLoading(false)
  }, [])

  return {
    isLoading: isInitialLoading || isPending,
    startTransition,
  }
}
