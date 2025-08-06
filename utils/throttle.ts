/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * Lightweight alternative to lodash throttle.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastExecuted = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    
    // If enough time has passed, execute immediately
    if (now - lastExecuted >= wait) {
      func.apply(this, args)
      lastExecuted = now
      return
    }
    
    // Otherwise, schedule execution for later
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, args)
        lastExecuted = Date.now()
        timeout = null
      }, wait - (now - lastExecuted))
    }
  }
}