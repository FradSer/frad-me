/**
 * Simple RequestAnimationFrame Manager
 * Provides a single RAF loop to avoid multiple concurrent loops
 */

type RAFCallback = (timestamp: number) => void

class RAFManager {
  private static instance: RAFManager
  private callbacks = new Map<string, RAFCallback>()
  private rafId: number | null = null

  private constructor() {}

  static getInstance(): RAFManager {
    if (!RAFManager.instance) {
      RAFManager.instance = new RAFManager()
    }
    return RAFManager.instance
  }

  subscribe(id: string, callback: RAFCallback): () => void {
    this.callbacks.set(id, callback)
    
    if (!this.rafId) {
      this.start()
    }

    return () => this.unsubscribe(id)
  }

  private unsubscribe(id: string): void {
    this.callbacks.delete(id)
    
    if (this.callbacks.size === 0) {
      this.stop()
    }
  }

  private start(): void {
    const tick = (timestamp: number) => {
      this.callbacks.forEach(callback => callback(timestamp))
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}

export default RAFManager