const isDevelopment = process.env.NODE_ENV === 'development'

const logChunkLoad = (chunkName: string, loadTime: number, success: boolean, error?: string) => {
  if (!isDevelopment) return
  
  const timeStr = loadTime.toFixed(2)
  if (success) {
    console.log(`✅ ${chunkName} loaded in ${timeStr}ms`)
  } else {
    console.error(`❌ ${chunkName} failed after ${timeStr}ms:`, error)
  }
}

export const measureChunkLoad = async <T>(
  chunkName: string,
  importFn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now()

  try {
    const module = await importFn()
    logChunkLoad(chunkName, performance.now() - startTime, true)
    return module
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logChunkLoad(chunkName, performance.now() - startTime, false, errorMessage)
    throw error
  }
}