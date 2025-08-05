import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'

type UseLoadingReturn = {
  isLoading: boolean
  startTransition: (callback: () => void) => void
}

/**
 * Hook for managing loading states in App Router
 * Uses React's useTransition for better UX during navigation
 */
export default function useLoading(): UseLoadingReturn {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Reset initial loading state after first render
    setIsInitialLoading(false)
  }, [])

  useEffect(() => {
    // Can be used to trigger effects on route changes
    // Currently no loading state needed for App Router
  }, [pathname])

  return {
    isLoading: isInitialLoading || isPending,
    startTransition,
  }
}
