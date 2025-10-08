/**
 * Authentication utility functions
 * Consolidated auth helpers for URL handling, domain normalization, etc.
 */

/**
 * Normalize auth domain URL by removing port in production
 * @param domain - Auth domain URL (e.g., "https://auth.stoocker.app:443" or "http://localhost:3000")
 * @returns Normalized domain URL
 */
export function normalizeAuthDomain(domain: string): string {
  // Remove trailing slash
  domain = domain.replace(/\/$/, '')

  // In production (https), remove port if present
  if (domain.startsWith('https://')) {
    return domain.split(':').slice(0, 2).join(':') // Keep https://domain, remove :port
  }

  // In development, keep as-is
  return domain
}

/**
 * Check if current hostname is the root domain (not a subdomain)
 * @param hostname - Current hostname (e.g., "stoocker.app", "auth.stoocker.app")
 * @param baseDomain - Base domain (e.g., "stoocker.app")
 * @returns True if hostname is root domain or www.rootdomain
 */
export function isRootDomain(hostname: string, baseDomain: string): boolean {
  return hostname === baseDomain || hostname === `www.${baseDomain}`
}

/**
 * Check if current hostname is the auth subdomain
 * @param hostname - Current hostname (e.g., "auth.stoocker.app")
 * @param authDomain - Auth domain URL (e.g., "https://auth.stoocker.app")
 * @returns True if hostname matches auth subdomain
 */
export function isAuthDomain(hostname: string, authDomain: string): boolean {
  const authHostname = authDomain.replace(/^https?:\/\//, '').split(':')[0]
  return hostname === authHostname || hostname.startsWith('auth.')
}

/**
 * Extract tenant subdomain from hostname
 * Returns null for root domain, auth domain, localhost
 * @param hostname - Current hostname
 * @param baseDomain - Base domain (e.g., "stoocker.app")
 * @returns Tenant subdomain or null
 */
export function extractTenantSubdomain(hostname: string, baseDomain: string): string | null {
  // Skip localhost
  if (hostname.includes('localhost') || hostname === '127.0.0.1') {
    return null
  }

  // Skip auth subdomain
  if (hostname.startsWith('auth.')) {
    return null
  }

  // Skip root domain
  if (isRootDomain(hostname, baseDomain)) {
    return null
  }

  // Extract subdomain (everything before base domain)
  const parts = hostname.split('.')
  const baseParts = baseDomain.split('.')

  if (parts.length > baseParts.length) {
    // Return subdomain (e.g., "acme" from "acme.stoocker.app")
    return parts.slice(0, parts.length - baseParts.length).join('.')
  }

  return null
}
