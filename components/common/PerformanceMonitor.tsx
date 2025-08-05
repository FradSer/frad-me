import { useEffect, useState } from 'react'
import RAFManager from '@/utils/animation/RAFManager'

interface PerformanceStats {
  fps: number
  activeSubscriptions: number
  memoryUsage?: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

/**
 * Development tool to monitor RAF performance and memory usage
 * Only renders in development mode
 */
export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right' 
}: PerformanceMonitorProps) {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    activeSubscriptions: 0,
  })

  useEffect(() => {
    if (!enabled) return

    const rafManager = RAFManager.getInstance()
    let animationId: number

    const updateStats = () => {
      const newStats: PerformanceStats = {
        fps: rafManager.getFPS(),
        activeSubscriptions: rafManager.getActiveSubscriptions(),
      }

      // Add memory info if available (Chrome DevTools)
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory
        newStats.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }

      setStats(newStats)
      animationId = requestAnimationFrame(updateStats)
    }

    updateStats()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [enabled])

  if (!enabled) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4', 
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400'
    if (fps >= 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-mono text-xs bg-black/80 text-white p-2 rounded backdrop-blur-sm`}>
      <div className="space-y-1">
        <div className={`flex justify-between gap-4 ${getFpsColor(stats.fps)}`}>
          <span>FPS:</span>
          <span className="font-bold">{stats.fps}</span>
        </div>
        <div className="flex justify-between gap-4 text-blue-400">
          <span>RAF:</span>
          <span className="font-bold">{stats.activeSubscriptions}</span>
        </div>
        {stats.memoryUsage && (
          <div className="flex justify-between gap-4 text-purple-400">
            <span>MEM:</span>
            <span className="font-bold">{stats.memoryUsage}MB</span>
          </div>
        )}
      </div>
    </div>
  )
}