import logger from '../utils/logger';
/**
 * Multi-layer Rate Limiting
 * - In-memory for development/fallback
 * - Redis for production distributed limiting
 */

interface RateLimitConfig {
  windowMs: number
  maxAttempts: number
  blockDurationMs?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

// In-memory store for development
class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>()

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.store.get(key)

    // Check if blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      }
    }

    // Reset window if expired
    if (!entry || entry.resetAt < now) {
      this.store.set(key, {
        count: 1,
        resetAt: now + config.windowMs
      })
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt: now + config.windowMs
      }
    }

    // Increment counter
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxAttempts) {
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs
      }
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000)
      }
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - entry.count,
      resetAt: entry.resetAt
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
}

// Redis rate limiter (production)
class RedisRateLimiter {
  private redisClient: any = null
  private initialized: boolean = false
  private initializing: boolean = false

  async initialize(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL
    if (!url || this.initialized || this.initializing) return

    this.initializing = true

    try {
      // Dynamic import with better error handling
      const redis = await import('redis').catch(() => null)
      if (!redis) {
        logger.error('Redis package not available, falling back to memory')
        this.initialized = true
        this.initializing = false
        return
      }

      this.redisClient = redis.createClient({ url })
      await this.redisClient.connect()
      this.initialized = true
      logger.info('Redis rate limiter connected successfully')
    } catch (error) {
      logger.error('Redis connection failed, falling back to memory:', error)
      this.initialized = true
    } finally {
      this.initializing = false
    }
  }

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    if (!this.redisClient?.isOpen) {
      return memoryLimiter.check(key, config)
    }

    const now = Date.now()
    const blockKey = `block:${key}`
    const countKey = `count:${key}`

    try {
      // Check if blocked
      const blockedUntil = await this.redisClient.get(blockKey)
      if (blockedUntil && parseInt(blockedUntil) > now) {
        const retryAfter = Math.ceil((parseInt(blockedUntil) - now) / 1000)
        return {
          allowed: false,
          remaining: 0,
          resetAt: parseInt(blockedUntil),
          retryAfter
        }
      }

      // Increment counter
      const count = await this.redisClient.incr(countKey)

      // Set expiry on first increment
      if (count === 1) {
        await this.redisClient.pExpire(countKey, config.windowMs)
      }

      const ttl = await this.redisClient.pTTL(countKey)
      const resetAt = now + (ttl > 0 ? ttl : config.windowMs)

      // Check if limit exceeded
      if (count > config.maxAttempts) {
        if (config.blockDurationMs) {
          await this.redisClient.set(blockKey, now + config.blockDurationMs, {
            PX: config.blockDurationMs
          })
        }
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter: Math.ceil((resetAt - now) / 1000)
        }
      }

      return {
        allowed: true,
        remaining: config.maxAttempts - count,
        resetAt
      }
    } catch (error) {
      logger.error('Redis rate limit error, falling back to memory:', error);
      return memoryLimiter.check(key, config)
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.redisClient?.isOpen) {
      return memoryLimiter.reset(key)
    }

    try {
      await this.redisClient.del(`count:${key}`, `block:${key}`)
    } catch (error) {
      logger.error('Redis reset error:', error);
    }
  }
}

// Singleton instances
const memoryLimiter = new MemoryRateLimiter()
const redisLimiter = new RedisRateLimiter()

// Lazy Redis initialization flag
let redisInitialized = false

// Initialize Redis lazily on first use
async function ensureRedisInitialized(): Promise<void> {
  if (redisInitialized) return

  try {
    // Check if REDIS_URL is set (safe access)
    const redisUrl = typeof process !== 'undefined' ? process.env.REDIS_URL : undefined
    if (redisUrl) {
      await redisLimiter.initialize()
    }
  } catch (error) {
    logger.error('Redis initialization error:', error)
  } finally {
    redisInitialized = true
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Email check: 10 attempts per 5 minutes
  EMAIL_CHECK: {
    windowMs: 5 * 60 * 1000,
    maxAttempts: 10
  },
  // Login: 5 attempts per 15 minutes, block for 30 minutes
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000
  },
  // Login per IP: 20 attempts per 15 minutes
  LOGIN_IP: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 20,
    blockDurationMs: 30 * 60 * 1000
  }
}

/**
 * Check rate limit for a key
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Ensure Redis is initialized (lazy, first-use initialization)
  await ensureRedisInitialized()

  // Check if Redis URL is configured and client is ready
  const useRedis = process.env.REDIS_URL && redisLimiter['redisClient']?.isOpen
  const limiter = useRedis ? redisLimiter : memoryLimiter
  return limiter.check(key, config)
}

/**
 * Reset rate limit for a key (use after successful auth)
 */
export async function resetRateLimit(key: string): Promise<void> {
  // Ensure Redis is initialized (lazy, first-use initialization)
  await ensureRedisInitialized()

  // Check if Redis URL is configured and client is ready
  const useRedis = process.env.REDIS_URL && redisLimiter['redisClient']?.isOpen
  const limiter = useRedis ? redisLimiter : memoryLimiter
  return limiter.reset(key)
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * Calculate exponential backoff delay for client-side
 */
export function calculateBackoff(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  const delay = Math.min(Math.pow(2, attemptNumber - 1) * 1000, 30000)
  return delay
}
