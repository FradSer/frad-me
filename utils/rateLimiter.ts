interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  window: number; // Time window in milliseconds
  max: number; // Maximum requests per window
}

interface RateLimitStore {
  [ip: string]: RateLimitEntry;
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Checks if a client IP has exceeded the rate limit
   *
   * @param ip - Client IP address
   * @returns True if request is allowed, false if rate limited
   */
  check(ip: string): boolean {
    const now = Date.now();
    const clientData = this.store[ip];

    if (!clientData || now > clientData.resetTime) {
      this.store[ip] = {
        count: 1,
        resetTime: now + this.config.window,
      };
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
    const clientData = this.store[ip];
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
}

/**
 * Creates a rate limiter with the specified configuration
 */
export const createRateLimiter = (config: RateLimitConfig) => new RateLimiter(config);
