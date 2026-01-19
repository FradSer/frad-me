interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  window: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  cleanupInterval?: number; // Interval to clean up expired entries (ms)
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private lastCleanup: number = Date.now();
  private readonly CLEANUP_INTERVAL: number;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.CLEANUP_INTERVAL = config.cleanupInterval ?? 60000; // Default 1 minute
  }

  /**
   * Checks if a client IP has exceeded the rate limit
   *
   * @param ip - Client IP address
   * @returns True if request is allowed, false if rate limited
   */
  check(ip: string): boolean {
    this.performCleanupIfNeeded();
    const now = Date.now();
    const clientData = this.store.get(ip);

    if (!clientData || now > clientData.resetTime) {
      this.store.set(ip, {
        count: 1,
        resetTime: now + this.config.window,
      });
      return true;
    }

    if (clientData.count >= this.config.max) {
      return false;
    }

    clientData.count++;
    return true;
  }

  /**
   * Gets the current rate limit status for an IP
   *
   * @param ip - Client IP address
   * @returns Rate limit information
   */
  getStatus(ip: string) {
    const clientData = this.store.get(ip);
    const now = Date.now();

    if (!clientData || now > clientData.resetTime) {
      return {
        count: 0,
        remaining: this.config.max,
        resetTime: null,
      };
    }

    return {
      count: clientData.count,
      remaining: Math.max(0, this.config.max - clientData.count),
      resetTime: clientData.resetTime,
    };
  }

  /**
   * Cleans up expired entries to prevent memory leaks
   */
  private performCleanupIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      // Use forEach to avoid downlevelIteration issues with Map iterator
      this.store.forEach((entry, ip) => {
        if (now > entry.resetTime) {
          this.store.delete(ip);
        }
      });
      this.lastCleanup = now;
    }
  }
}

/**
 * Creates a rate limiter with the specified configuration
 */
export const createRateLimiter = (config: RateLimitConfig) => new RateLimiter(config);
