import { z } from 'zod'

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Public URLs (accessible from browser)
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_BASE_DOMAIN: z
    .string()
    .min(1, 'NEXT_PUBLIC_BASE_DOMAIN is required in production')
    .default('localhost:3001'),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().default('http://localhost:3000'),

  // Server-side only URLs (internal network)
  API_INTERNAL_URL: z.string().url().optional().default('http://localhost:5000'),

  // Security
  HMAC_SECRET: z.string().min(32).optional(),

  // Cookie domain for cross-subdomain auth (optional, falls back to NEXT_PUBLIC_BASE_DOMAIN)
  COOKIE_BASE_DOMAIN: z.string().optional(),

  // Redis (for rate limiting)
  REDIS_URL: z.string().url().optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
})

// Validate environment variables (lazy - only when accessed)
let _env: z.infer<typeof envSchema> | null = null

function getEnv(): z.infer<typeof envSchema> {
  if (_env) return _env

  // During build time, skip validation and use defaults
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

  try {
    _env = envSchema.parse(process.env)
    return _env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues?.map(e => e.path.join('.')).join(', ') || 'unknown'

      // During build time, always use defaults
      if (isBuildTime) {
        console.warn('[BUILD] Environment validation failed, using defaults:', missingVars)
        _env = envSchema.parse({})
        return _env
      }

      // In production runtime, throw the error - all required vars must be set
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missingVars}`)
      }

      // In development, use defaults
      console.warn('Environment validation failed, using defaults:', missingVars)

      // Use defaults by parsing empty object (schema has defaults)
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
  const cookieDomain = env.COOKIE_BASE_DOMAIN || env.NEXT_PUBLIC_BASE_DOMAIN

  // Add leading dot for subdomain sharing (e.g., .stoocker.app)
  return `.${cookieDomain}`
}

// Get API URL (internal for server-side, public for client-side)
export function getApiUrl(serverSide = false): string {
  return serverSide ? env.API_INTERNAL_URL : env.NEXT_PUBLIC_API_URL
}

// Get auth URL (removes port for production HTTPS)
export function getAuthUrl(path: string = ''): string {
  let authDomain: string

  // Client-side: detect from current location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    console.log('[getAuthUrl] hostname:', hostname, 'protocol:', protocol)

    // If on localhost, use localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      authDomain = 'http://localhost:3000'
      console.log('[getAuthUrl] Using localhost')
    } else {
      // Production: extract base domain from current hostname
      // stoocker.app → stoocker.app
      // auth.stoocker.app → stoocker.app
      // demo.stoocker.app → stoocker.app
      const parts = hostname.split('.')
      const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname

      authDomain = `${protocol}//auth.${baseDomain}`
      console.log('[getAuthUrl] Using production, hostname:', hostname, 'baseDomain:', baseDomain, 'authDomain:', authDomain)
    }
  } else {
    // Force rebuild timestamp: 2025-10-08T12:00:00
    // Server-side: use env variable
    authDomain = env.NEXT_PUBLIC_AUTH_DOMAIN
    console.log('[getAuthUrl] Server-side, using env:', authDomain)
  }

  // Remove port from HTTPS URLs
  const cleanDomain = authDomain.startsWith('https://')
    ? authDomain.split(':').slice(0, 2).join(':')
    : authDomain

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanDomain}${cleanPath}`
}
