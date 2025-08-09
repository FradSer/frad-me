/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * Lightweight alternative to lodash throttle.
 * 
 * @template TFunc - The function type being throttled
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @returns A throttled version of the input function
 * 
 * @example
 * ```typescript
 * const throttledCallback = throttle((x: number, y: number) => {
 *   console.log(`Position: ${x}, ${y}`)
 * }, 100)
 * 
 * // Will only log at most once per 100ms
 * window.addEventListener('mousemove', (e) => {
 *   throttledCallback(e.clientX, e.clientY)
 * })
 * ```
 */
export function throttle<TFunc extends (...args: any[]) => any>(
  func: TFunc,
  wait: number
): (...args: Parameters<TFunc>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let lastExecuted = 0

  return function (this: ThisParameterType<TFunc>, ...args: Parameters<TFunc>): void {
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