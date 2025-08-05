interface ChunkLoadMetrics {
  chunkName: string
  loadTime: number
  success: boolean
  error?: string
  timestamp: number
}

export const measureChunkLoad = async <T>(
  chunkName: string,
  importFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now()

  try {
    const module = await importFn()
    const loadTime = performance.now() - startTime

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${chunkName} loaded in ${loadTime.toFixed(2)}ms`)
    }

    return module
  } catch (error) {
    const loadTime = performance.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${chunkName} failed after ${loadTime.toFixed(2)}ms:`, errorMessage)
    }

    throw error
  }
}