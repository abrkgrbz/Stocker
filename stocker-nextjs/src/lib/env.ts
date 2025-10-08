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

function getEnv() {
  if (_env) return _env

  try {
    _env = envSchema.parse(process.env)
    return _env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ')
      console.error('Environment validation failed:', missingVars)
      // Return defaults for build time
      _env = envSchema.parse({})
      return _env
    }
    throw error
  }
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get: (_, prop) => {
    return getEnv()[prop as keyof z.infer<typeof envSchema>]
  }
})

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Get tenant URL (server-side or client-side safe)
export function getTenantUrl(tenantCode: string): string {
  const protocol = isDevelopment ? 'http' : 'https'
  const baseDomain = isDevelopment ? 'localhost:3001' : env.NEXT_PUBLIC_BASE_DOMAIN
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
  const isDev = isDevelopment

  if (isDev) {
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
