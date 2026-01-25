/**
 * Simple in-memory rate limiter for authentication endpoints
 * Prevents brute force attacks by limiting requests per IP
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Check if a request should be allowed
   * @param identifier - Unique identifier (e.g., IP address or email)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success flag and remaining attempts
   */
  check(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes default
  ): { success: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // No record or expired - allow and create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        remainingAttempts: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    // Record exists and not expired
    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remainingAttempts: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count and allow
    record.count++;
    this.requests.set(identifier, record);

    return {
      success: true,
      remainingAttempts: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get remaining time until reset in minutes
   * @param resetTime - Reset time in milliseconds
   * @returns Minutes until reset
   */
  getMinutesUntilReset(resetTime: number): number {
    const now = Date.now();
    const diff = resetTime - now;
    return Math.ceil(diff / (60 * 1000));
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  OTP_SEND: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  OTP_VERIFY: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};
