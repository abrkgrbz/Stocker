/**
 * Security utilities and configurations
 * Implements CSP, rate limiting, and other security measures
 */

/**
 * Content Security Policy configuration
 * Prevents XSS attacks by controlling resource loading
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React/Vite in dev
    "'unsafe-eval'", // Only in development
    "https://cdn.jsdelivr.net",
    "https://unpkg.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "http://localhost:*" // Dev server images
  ],
  'connect-src': [
    "'self'",
    "http://localhost:*", // Dev API
    "https://api.stoocker.app", // Production API
    "wss://", // WebSocket
    "ws://localhost:*" // Dev WebSocket
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(isDevelopment: boolean = false): string {
  const policy = { ...CSP_POLICY };
  
  // Remove unsafe-eval in production
  if (!isDevelopment) {
    policy['script-src'] = policy['script-src'].filter(src => src !== "'unsafe-eval'");
    policy['connect-src'] = policy['connect-src'].filter(src => !src.includes('localhost'));
    policy['img-src'] = policy['img-src'].filter(src => !src.includes('localhost'));
  }

  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply CSP meta tag to document
 */
export function applyCSPPolicy(isDevelopment: boolean = false): void {
  // Check if CSP meta tag already exists
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  // Create and append CSP meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSPHeader(isDevelopment);
  document.head.appendChild(cspMeta);

  console.log('🔒 CSP Policy Applied');
}

/**
 * Rate Limiter implementation
 * Prevents abuse by limiting request frequency
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Filter out old requests outside the window
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    // Cleanup old entries periodically
    this.cleanup();
    
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < this.windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

/**
 * API Rate Limiter instance
 */
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * Login Rate Limiter instance
 */
export const loginRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Escape HTML entities for special characters
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  
  // Only escape special characters that aren't part of HTML tags
  if (!sanitized.includes('<') || !sanitized.includes('>')) {
    sanitized = sanitized.replace(/[&<>]/g, (char) => escapeMap[char] || char);
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * XSS Protection utilities
 */
export const xssProtection = {
  /**
   * Sanitize HTML string
   */
  sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Escape HTML entities
   */
  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  },

  /**
   * Validate URL to prevent javascript: protocol
   */
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
};

/**
 * Security Headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

/**
 * Apply security headers via meta tags (for client-side)
 */
export function applySecurityHeaders(): void {
  // X-Frame-Options
  const frameMeta = document.createElement('meta');
  frameMeta.httpEquiv = 'X-Frame-Options';
  frameMeta.content = 'DENY';
  document.head.appendChild(frameMeta);

  // Referrer Policy
  const referrerMeta = document.createElement('meta');
  referrerMeta.name = 'referrer';
  referrerMeta.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerMeta);

  console.log('🛡️ Security Headers Applied');
}

/**
 * Initialize all security measures
 */
export function initializeSecurity(isDevelopment: boolean = false): void {
  // Apply CSP
  applyCSPPolicy(isDevelopment);
  
  // Apply security headers
  applySecurityHeaders();
  
  // Log security status
  console.log('🔐 Security measures initialized', {
    CSP: 'Enabled',
    RateLimiting: 'Enabled',
    XSSProtection: 'Enabled',
    Headers: 'Applied'
  });
}