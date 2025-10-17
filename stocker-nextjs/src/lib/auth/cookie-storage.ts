/**
 * Cookie-based storage for authentication tokens
 * Supports cross-subdomain access with domain=.stoocker.app
 */

const COOKIE_DOMAIN = typeof window !== 'undefined'
  ? window.location.hostname.includes('stoocker.app')
    ? '.stoocker.app'
    : undefined
  : undefined;

const COOKIE_OPTIONS = {
  domain: COOKIE_DOMAIN,
  path: '/',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'lax' as const,
};

export const cookieStorage = {
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days expiry

    const cookieParts = [
      `${key}=${encodeURIComponent(value)}`,
      `expires=${expires.toUTCString()}`,
      `path=${COOKIE_OPTIONS.path}`,
    ];

    if (COOKIE_OPTIONS.domain) {
      cookieParts.push(`domain=${COOKIE_OPTIONS.domain}`);
    }

    if (COOKIE_OPTIONS.secure) {
      cookieParts.push('secure');
    }

    cookieParts.push(`samesite=${COOKIE_OPTIONS.sameSite}`);

    document.cookie = cookieParts.join('; ');
  },

  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split('=');
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  },

  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;

    const cookieParts = [
      `${key}=`,
      'expires=Thu, 01 Jan 1970 00:00:00 GMT',
      `path=${COOKIE_OPTIONS.path}`,
    ];

    if (COOKIE_OPTIONS.domain) {
      cookieParts.push(`domain=${COOKIE_OPTIONS.domain}`);
    }

    document.cookie = cookieParts.join('; ');
  },
};
