// Simple in-memory rate limiter for API endpoints
// In production, consider using Redis-backed rate limiting

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number;    // Time window in milliseconds
  max: number;         // Maximum number of requests allowed
  message?: string;    // Custom message to return when rate limit exceeded
}

export function rateLimit(options: RateLimitOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Extract IP address from the request
      let ip = 'unknown';

      // Try to find the request object in the arguments
      for (const arg of args) {
        if (arg && arg.headers && arg.ip) {
          ip = arg.ip;
          break;
        }

        // Try to find IP in headers
        if (arg && arg.headers) {
          const headers = arg.headers;
          ip = headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               headers['x-real-ip'] ||
               'unknown';
          break;
        }
      }

      const key = `${propertyName}:${ip}`;
      const now = Date.now();
      const windowEnd = now + options.windowMs;

      if (!store[key]) {
        store[key] = {
          count: 1,
          resetTime: windowEnd
        };
      } else {
        // Check if the window has expired
        if (now >= store[key].resetTime) {
          store[key] = {
            count: 1,
            resetTime: windowEnd
          };
        } else {
          store[key].count++;

          if (store[key].count > options.max) {
            // Return rate limit exceeded response
            // In a real implementation, this would need to return a proper NextResponse
            const response = {
              status: 429,
              json: () => Promise.resolve({
                error: options.message || 'Rate limit exceeded'
              })
            };

            // This is a simplified implementation
            throw new Error(options.message || 'Rate limit exceeded');
          }
        }
      }

      // Execute the original method
      return method.apply(this, args);
    };

    return descriptor;
  };
}

// Alternative function-based approach for rate limiting in Next.js API routes
export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly windowMs: number;
  private readonly max: number;
  private readonly message: string;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.message = options.message || 'Rate limit exceeded';
  }

  check(identifier: string): { allowed: boolean; message?: string; resetTime?: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record) {
      // First request from this identifier
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true };
    }

    // Check if window has expired
    if (now >= record.resetTime) {
      // Reset the counter for this identifier
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true };
    }

    // Increment the count
    record.count++;
    this.store.set(identifier, record);

    if (record.count > this.max) {
      return {
        allowed: false,
        message: this.message,
        resetTime: record.resetTime
      };
    }

    return { allowed: true };
  }

  // Cleanup old records periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}