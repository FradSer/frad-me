/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * This is a lightweight alternative to lodash's throttle function.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= wait) {
          func.apply(this, args)
          lastRan = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastRan), 0))
    }
  }
}