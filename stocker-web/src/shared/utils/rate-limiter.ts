interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RequestInfo {
  count: number;
  resetTime: number;
  blocked?: boolean;
  blockUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RequestInfo> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDurationMs: 60000, // 1 minute default block
      ...config,
    };
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const info = this.limits.get(key);

    if (!info) {
      // First request
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Check if blocked
    if (info.blocked && info.blockUntil && now < info.blockUntil) {
      return false;
    }

    // Check if window has passed
    if (now >= info.resetTime) {
      // Reset window
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Check rate limit
    if (info.count >= this.config.maxRequests) {
      // Block the key
      this.limits.set(key, {
        ...info,
        blocked: true,
        blockUntil: now + this.config.blockDurationMs!,
      });
      return false;
    }

    // Increment count
    this.limits.set(key, {
      ...info,
      count: info.count + 1,
    });

    return true;
  }

  reset(key: string): void {
    this.limits.delete(key);
  }

  getRemainingRequests(key: string): number {
    const info = this.limits.get(key);
    if (!info) return this.config.maxRequests;
    
    const now = Date.now();
    if (now >= info.resetTime) return this.config.maxRequests;
    
    return Math.max(0, this.config.maxRequests - info.count);
  }

  getResetTime(key: string): number {
    const info = this.limits.get(key);
    return info?.resetTime || Date.now() + this.config.windowMs;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.limits.entries()) {
      if (now >= info.resetTime + this.config.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiters for different operations
export const loginRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

export const refreshTokenRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
});

// Cleanup old entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    loginRateLimiter.cleanup();
    apiRateLimiter.cleanup();
    refreshTokenRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

// Exponential backoff for retries
export class ExponentialBackoff {
  private baseDelay: number;
  private maxDelay: number;
  private maxRetries: number;
  private jitter: boolean;

  constructor(
    baseDelay = 1000,
    maxDelay = 30000,
    maxRetries = 5,
    jitter = true
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.maxRetries = maxRetries;
    this.jitter = jitter;
  }

  async execute<T>(
    fn: () => Promise<T>,
    retryOn?: (error: any) => boolean
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (retryOn && !retryOn(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.maxRetries - 1) {
          throw error;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    let delay = Math.min(this.baseDelay * Math.pow(2, attempt), this.maxDelay);

    if (this.jitter) {
      // Add random jitter (±25%)
      const jitterAmount = delay * 0.25;
      delay = delay + (Math.random() * 2 - 1) * jitterAmount;
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Request queue for managing concurrent requests
export class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const fn = this.queue.shift();

    if (fn) {
      try {
        await fn();
      } finally {
        this.running--;
        this.process();
      }
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }

  clear(): void {
    this.queue = [];
  }
}

// Global request queue
export const globalRequestQueue = new RequestQueue(10);