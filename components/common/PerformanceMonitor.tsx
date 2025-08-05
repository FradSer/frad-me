import { useEffect, useState } from 'react'

interface PerformanceMonitorProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

/**
 * Simple development performance monitor
 */
export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right' 
}: PerformanceMonitorProps) {
  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState<number>()

  useEffect(() => {
    if (!enabled) return

    let frameCount = 0
    let lastTime = performance.now()
    let rafId: number

    const updateStats = () => {
      frameCount++
      const currentTime = performance.now()
      
      // Update FPS every second
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime

        // Update memory if available
        if ('memory' in performance) {
          const mem = (performance as any).memory
          setMemory(Math.round(mem.usedJSHeapSize / 1024 / 1024))
        }
      }

      rafId = requestAnimationFrame(updateStats)
    }

    rafId = requestAnimationFrame(updateStats)
    return () => cancelAnimationFrame(rafId)
  }, [enabled])

  if (!enabled) return null

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4', 
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  const fpsColor = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className={`fixed ${positions[position]} z-50 font-mono text-xs bg-black/80 text-white p-2 rounded backdrop-blur-sm space-y-1`}>
      <div className={`flex justify-between gap-4 ${fpsColor}`}>
        <span>FPS:</span>
        <span className="font-bold">{fps}</span>
      </div>
      {memory && (
        <div className="flex justify-between gap-4 text-purple-400">
          <span>MEM:</span>
          <span className="font-bold">{memory}MB</span>
        </div>
      )}
    </div>
  )
}