import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  RateLimiter, 
  initializeSecurity, 
  sanitizeInput, 
  validateEmail,
  validatePassword,
  generateCSPHeader 
} from './security';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter(3, 60000); // 3 requests per minute
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit', () => {
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(false); // 4th request should be blocked
  });

  it('should track different identifiers separately', () => {
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user2')).toBe(true); // Different user
    expect(rateLimiter.isAllowed('user2')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true); // user1's 3rd request
    expect(rateLimiter.isAllowed('user1')).toBe(false); // user1's 4th request blocked
    expect(rateLimiter.isAllowed('user2')).toBe(true); // user2's 3rd request still allowed
  });

  it('should reset after time window', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    
    // Use up all requests
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    expect(rateLimiter.isAllowed('user1')).toBe(false);
    
    // Advance time past the window
    vi.setSystemTime(now + 61000); // 61 seconds later
    
    // Should be allowed again
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  it('should clean up old requests within window', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    
    vi.setSystemTime(now + 30000); // 30 seconds later
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    
    vi.setSystemTime(now + 59000); // 59 seconds later
    expect(rateLimiter.isAllowed('user1')).toBe(true);
    
    // First request should still be in window
    expect(rateLimiter.isAllowed('user1')).toBe(false);
    
    vi.setSystemTime(now + 61000); // 61 seconds later
    // First request should be expired now
    expect(rateLimiter.isAllowed('user1')).toBe(true);
  });

  describe('reset', () => {
    it('should clear specific identifier', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(false);
      
      rateLimiter.reset('user1');
      
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should clear all identifiers when no identifier specified', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      
      rateLimiter.reset();
      
      // Both should have full quota again
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });
  });
});

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('<div onclick="alert(1)">Test</div>')).toBe('<div>Test</div>');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('<a href="javascript:alert(1)">Link</a>')).toBe('<a href="">Link</a>');
    });

    it('should handle data: protocol', () => {
      expect(sanitizeInput('<a href="data:text/html,<script>alert(1)</script>">Link</a>'))
        .toBe('<a href="">Link</a>');
    });

    it('should preserve safe HTML', () => {
      expect(sanitizeInput('<p>Hello <strong>World</strong></p>'))
        .toBe('<p>Hello <strong>World</strong></p>');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should handle special characters', () => {
      expect(sanitizeInput('Hello & <World>')).toBe('Hello &amp; &lt;World&gt;');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('user_123@example-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Str0ng@Pass')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('password')).toBe(false); // no uppercase, no number
      expect(validatePassword('PASSWORD')).toBe(false); // no lowercase, no number
      expect(validatePassword('Password')).toBe(false); // no number
      expect(validatePassword('password123')).toBe(false); // no uppercase
      expect(validatePassword('PASSWORD123')).toBe(false); // no lowercase
      expect(validatePassword('Pass1')).toBe(false); // too short
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('generateCSPHeader', () => {
    it('should generate development CSP', () => {
      const csp = generateCSPHeader(true);
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("'unsafe-inline'");
      expect(csp).toContain("'unsafe-eval'");
      expect(csp).toContain('http://localhost:*');
    });

    it('should generate production CSP', () => {
      const csp = generateCSPHeader(false);
      expect(csp).toContain("default-src 'self'");
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).not.toContain('http://localhost:*');
    });

    it('should include necessary domains', () => {
      const csp = generateCSPHeader(false);
      expect(csp).toContain('https://api.stocker.com');
      expect(csp).toContain('https://cdn.jsdelivr.net');
    });
  });

  describe('initializeSecurity', () => {
    it('should set CSP meta tag', () => {
      document.head.innerHTML = ''; // Clear head
      initializeSecurity(true);
      
      const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(metaTag).toBeTruthy();
      expect(metaTag?.getAttribute('content')).toContain("default-src 'self'");
    });

    it('should not duplicate CSP meta tag', () => {
      document.head.innerHTML = ''; // Clear head
      initializeSecurity(true);
      initializeSecurity(true); // Call twice
      
      const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      expect(metaTags.length).toBe(1);
    });
  });
});