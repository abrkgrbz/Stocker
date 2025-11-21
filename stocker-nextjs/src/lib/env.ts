import { z } from 'zod'

import logger from '@/lib/utils/logger';
// Development schema (permissive with defaults)
const devEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_BASE_DOMAIN: z.string().default('localhost:3001'),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().default('http://localhost:3000'),
  API_INTERNAL_URL: z.string().url().optional().default('http://localhost:5000'),
  HMAC_SECRET: z.string().min(32).optional(),
  COOKIE_BASE_DOMAIN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
})

// Production schema (strict, no defaults for critical vars)
const prodEnvSchema = z.object({
  NODE_ENV: z.literal('production'),
  // Public URLs - REQUIRED in production
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL in production'),
  NEXT_PUBLIC_BASE_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_BASE_DOMAIN is required in production'),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().url('NEXT_PUBLIC_AUTH_DOMAIN must be a valid URL in production'),
  // Server-side URLs - Optional (only needed server-side, not in browser)
  API_INTERNAL_URL: z.string().url().optional(),
  // Security - Optional (only needed server-side for HMAC operations)
  HMAC_SECRET: z.string().min(32).optional(),
  // Optional
  COOKIE_BASE_DOMAIN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
})

// Select schema based on NODE_ENV
const envSchema = process.env.NODE_ENV === 'production' ? prodEnvSchema : devEnvSchema

// Validate environment variables (lazy - only when accessed)
let _env: z.infer<typeof envSchema> | null = null

function getEnv(): z.infer<typeof envSchema> {
  if (_env) return _env

  const isProduction = process.env.NODE_ENV === 'production'

  try {
    _env = envSchema.parse(process.env)
    return _env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues?.map(e => e.path.join('.')).join(', ') || 'unknown'

      if (isProduction) {
        // FAIL FAST in production - no defaults, no fallbacks
        throw new Error(`❌ Production build failed - Missing required environment variables: ${missingVars}`)
      }

      // Development: warn and use defaults
      console.warn('[ENV] Using development defaults for:', missingVars);

      try {
        _env = envSchema.parse({})
        return _env
      } catch {
        // If even defaults fail, create minimal valid env
        const fallbackEnv: z.infer<typeof envSchema> = {
          NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
          NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3001',
          NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'http://localhost:3000',
          API_INTERNAL_URL: process.env.API_INTERNAL_URL || 'http://localhost:5000',
        }
        _env = fallbackEnv
        return fallbackEnv
      }
    }
    throw error
  }
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get: (_, prop) => {
    const envData = getEnv()
    return envData[prop as keyof z.infer<typeof envSchema>]
  }
})

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Helper functions (lazy evaluation to avoid build-time env access)
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}

// Get tenant URL (server-side or client-side safe)
export function getTenantUrl(tenantCode: string): string {
  const protocol = isDevelopment() ? 'http' : 'https'
  const baseDomain = isDevelopment() ? 'localhost:3001' : env.NEXT_PUBLIC_BASE_DOMAIN
  return `${protocol}://${tenantCode}.${baseDomain}`
}

// Client-safe tenant URL helper (uses NEXT_PUBLIC_ vars only)
export function getClientTenantUrl(tenantCode: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use full env
    return getTenantUrl(tenantCode)
  }

  // Client-side: use only NEXT_PUBLIC_ vars
  const isDev = process.env.NODE_ENV === 'development'
  const protocol = isDev ? 'http' : 'https'
  const baseDomain = isDev
    ? 'localhost:3001'
    : process.env.NEXT_PUBLIC_BASE_DOMAIN

  if (!baseDomain) {
    throw new Error('NEXT_PUBLIC_BASE_DOMAIN is required in production')
  }

  return `${protocol}://${tenantCode}.${baseDomain}`
}

// Get cookie domain for cross-subdomain authentication
export function getCookieDomain(): string | undefined {
  if (isDevelopment()) {
    return undefined // localhost doesn't need domain
  }

  // Use COOKIE_BASE_DOMAIN if set, otherwise fall back to NEXT_PUBLIC_BASE_DOMAIN
  const cookieDomain = (env.COOKIE_BASE_DOMAIN as string | undefined) || env.NEXT_PUBLIC_BASE_DOMAIN

  // Add leading dot for subdomain sharing (e.g., .stoocker.app)
  return `.${cookieDomain}`
}

// Get API URL (internal for server-side, public for client-side)
export function getApiUrl(serverSide = false): string {
  if (serverSide && env.API_INTERNAL_URL) {
    return env.API_INTERNAL_URL
  }
  return env.NEXT_PUBLIC_API_URL
}

// Get auth URL (removes port for production HTTPS)
export function getAuthUrl(path: string = ''): string {
  let authDomain: string

  // Client-side: detect from current location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    logger.info('[getAuthUrl] hostname:', hostname, 'protocol:', protocol);

    // If on localhost, use localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      authDomain = 'http://localhost:3000'
      logger.info('[getAuthUrl] Using localhost');
    } else {
      // Production: extract base domain from current hostname
      // stoocker.app → stoocker.app
      // auth.stoocker.app → stoocker.app
      // demo.stoocker.app → stoocker.app
      const parts = hostname.split('.')
      const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname

      authDomain = `${protocol}//auth.${baseDomain}`
      logger.info('[getAuthUrl] Using production, hostname:', hostname, 'baseDomain:', baseDomain, 'authDomain:', authDomain);
    }
  } else {
    // Force rebuild timestamp: 2025-10-08T12:00:00
    // Server-side: use env variable
    authDomain = env.NEXT_PUBLIC_AUTH_DOMAIN
    logger.info('[getAuthUrl] Server-side, using env:', authDomain);
  }

  // Remove port from HTTPS URLs
  const cleanDomain = authDomain.startsWith('https://')
    ? authDomain.split(':').slice(0, 2).join(':')
    : authDomain

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanDomain}${cleanPath}`
}
