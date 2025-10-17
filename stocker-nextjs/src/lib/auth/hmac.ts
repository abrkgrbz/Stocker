import crypto from 'crypto'
import { env } from '@/lib/env'

/**
 * HMAC-based tenant signature for secure tenant validation
 *
 * Flow:
 * 1. check-email returns tenant with HMAC signature + timestamp
 * 2. Client sends signature back with login request
 * 3. Backend validates signature to prevent tenant spoofing
 */

const HMAC_SECRET = env.HMAC_SECRET || 'your-secret-key-change-in-production'
const SIGNATURE_VALIDITY_MS = 5 * 60 * 1000 // 5 minutes

export interface TenantSignature {
  signature: string
  timestamp: number
}

export interface SignedTenant {
  tenantCode: string
  signature: string
  timestamp: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Generate HMAC signature for tenant code
 * Used in check-email response
 */
export function generateTenantSignature(tenantCode: string): TenantSignature {
  const timestamp = Date.now()
  const message = `${tenantCode}:${timestamp}`

  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(message)
    .digest('hex')

  return {
    signature,
    timestamp
  }
}

/**
 * Validate HMAC signature for tenant
 * Used in login endpoint to verify tenant wasn't tampered with
 */
export function validateSignedTenant(signed: SignedTenant): ValidationResult {
  const { tenantCode, signature, timestamp } = signed

  // Check timestamp validity (prevent replay attacks)
  // Backend sends timestamp in SECONDS, we need to convert to milliseconds
  const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  const age = Date.now() - timestampMs

  if (age > SIGNATURE_VALIDITY_MS) {
    return {
      valid: false,
      error: 'Signature expired'
    }
  }

  if (age < 0) {
    return {
      valid: false,
      error: 'Invalid timestamp (future)'
    }
  }

  // Regenerate expected signature (must match backend base64 format)
  const message = `${tenantCode}:${timestamp}`
  const expectedSignature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(message)
    .digest('base64')

  // Constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid signature'
    }
  }

  return { valid: true }
}

/**
 * Generate signature for any data (generic HMAC utility)
 */
export function generateHmacSignature(data: string): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(data)
    .digest('hex')
}

/**
 * Verify generic HMAC signature
 */
export function verifyHmacSignature(data: string, signature: string): boolean {
  const expectedSignature = generateHmacSignature(data)

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}
