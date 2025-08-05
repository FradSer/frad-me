/**
 * Centralized RequestAnimationFrame Manager
 * 
 * Provides a single RAF loop for the entire application to improve performance
 * by eliminating multiple concurrent RAF loops that can cause frame drops.
 */

type RAFCallback = (timestamp: DOMHighResTimeStamp, deltaTime: number) => void

interface RAFSubscription {
  id: string
  callback: RAFCallback
  priority: number
}

class RAFManager {
  private static instance: RAFManager
  private subscriptions: Map<string, RAFSubscription> = new Map()
  private rafId: number | null = null
  private isRunning = false
  private lastTimestamp = 0
  private frameCount = 0
  private fps = 0
  private lastFpsUpdate = 0

  private constructor() {}

  static getInstance(): RAFManager {
    if (!RAFManager.instance) {
      RAFManager.instance = new RAFManager()
    }
    return RAFManager.instance
  }

  /**
   * Subscribe to the RAF loop
   * @param id Unique identifier for the subscription
   * @param callback Function to call on each frame
   * @param priority Higher priority callbacks are executed first (default: 0)
   * @returns Unsubscribe function
   */
  subscribe(id: string, callback: RAFCallback, priority = 0): () => void {
    this.subscriptions.set(id, { id, callback, priority })
    
    if (!this.isRunning) {
      this.start()
    }

    return () => this.unsubscribe(id)
  }

  /**
   * Unsubscribe from the RAF loop
   */
  unsubscribe(id: string): void {
    this.subscriptions.delete(id)
    
    if (this.subscriptions.size === 0 && this.isRunning) {
      this.stop()
    }
  }

  /**
   * Get current FPS (updated every second)
   */
  getFPS(): number {
    return this.fps
  }

  /**
   * Get number of active subscriptions
   */
  getActiveSubscriptions(): number {
    return this.subscriptions.size
  }

  private start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastTimestamp = performance.now()
    this.tick(this.lastTimestamp)
  }

  private stop(): void {
    if (!this.isRunning) return
    
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private tick = (timestamp: DOMHighResTimeStamp): void => {
    if (!this.isRunning) return

    const deltaTime = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp

    // Update FPS counter
    this.frameCount++
    if (timestamp - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate))
      this.frameCount = 0
      this.lastFpsUpdate = timestamp
    }

    // Sort subscriptions by priority (higher first)
    const sortedSubscriptions = Array.from(this.subscriptions.values())
      .sort((a, b) => b.priority - a.priority)

    // Execute callbacks with error handling
    for (const subscription of sortedSubscriptions) {
      try {
        subscription.callback(timestamp, deltaTime)
      } catch (error) {
        console.error(`RAF callback error for ${subscription.id}:`, error)
        // Continue with other callbacks even if one fails
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }
}

export default RAFManager