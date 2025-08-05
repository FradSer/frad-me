import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

type Loading = {
  isLoading: boolean
}

function useLoading(): Loading {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  return { isLoading }
}

export default useLoading
