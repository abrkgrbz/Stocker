/**
 * Security Headers Configuration
 * Implements recommended security headers for the application
 */

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Production security headers
 * These headers enhance application security when served in production
 */
export const PRODUCTION_HEADERS: SecurityHeaders = {
  // Content Security Policy - Prevents XSS attacks
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.stocker.local https://*.stocker.local wss://*.stocker.local",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),

  // HTTP Strict Transport Security (if using HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent DNS prefetching
  'X-DNS-Prefetch-Control': 'off',

  // Disable browser features
  'X-Permitted-Cross-Domain-Policies': 'none',

  // Cache control for security
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Development security headers
 * More relaxed for development environment
 */
export const DEVELOPMENT_HEADERS: SecurityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' http://localhost:* ws://localhost:*",
    "worker-src 'self' blob:"
  ].join('; '),
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff'
};

/**
 * Get appropriate security headers based on environment
 */
export function getSecurityHeaders(isDevelopment = false): SecurityHeaders {
  return isDevelopment ? DEVELOPMENT_HEADERS : PRODUCTION_HEADERS;
}

/**
 * Apply security headers to Vite dev server
 * Add this to vite.config.ts server configuration
 */
export function configureViteSecurityHeaders(isDevelopment = true) {
  return {
    headers: getSecurityHeaders(isDevelopment)
  };
}

/**
 * Generate meta tags for security headers that can be set via HTML
 */
export function generateSecurityMetaTags(): string[] {
  const headers = getSecurityHeaders();
  const metaTags: string[] = [];

  // CSP can be set via meta tag
  if (headers['Content-Security-Policy']) {
    metaTags.push(
      `<meta http-equiv="Content-Security-Policy" content="${headers['Content-Security-Policy']}">`
    );
  }

  // Referrer Policy can be set via meta tag
  if (headers['Referrer-Policy']) {
    metaTags.push(
      `<meta name="referrer" content="${headers['Referrer-Policy']}">`
    );
  }

  return metaTags;
}

/**
 * Security header validation
 * Checks if required security headers are present
 */
export function validateSecurityHeaders(headers: Headers): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection'
  ];

  const recommendedHeaders = [
    'Referrer-Policy',
    'Permissions-Policy',
    'Strict-Transport-Security'
  ];

  const missing = requiredHeaders.filter(header => !headers.get(header));
  const warnings = recommendedHeaders.filter(header => !headers.get(header));

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Nonce generator for inline scripts (if needed)
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Report-Only CSP for testing
 * Use this to test CSP without breaking functionality
 */
export function getReportOnlyCSP(): string {
  return [
    "default-src 'self'",
    "report-uri /api/security/csp-report",
    "report-to default"
  ].join('; ');
}

export default {
  getSecurityHeaders,
  configureViteSecurityHeaders,
  generateSecurityMetaTags,
  validateSecurityHeaders,
  generateNonce,
  getReportOnlyCSP,
  PRODUCTION_HEADERS,
  DEVELOPMENT_HEADERS
};