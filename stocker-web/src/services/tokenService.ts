/**
 * Secure Token Management Service
 * Uses httpOnly cookies for XSS protection
 * Falls back to memory storage for tokens
 */

import { API_BASE_URL } from '@/config/constants';

class TokenService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Initialize tokens from cookies on app start
   * Cookies are set by backend with httpOnly flag
   */
  async initialize(): Promise<void> {
    // Check if we have valid session
    try {
      const response = await fetch(`${API_BASE_URL}/api/secure-auth/session`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Store tokens in memory only (not localStorage)
        this.accessToken = data.accessToken || null;
        this.refreshToken = data.refreshToken || null;
      }
    } catch (error) {
      // Session check failed, tokens will be null
      this.clearTokens();
    }
  }

  /**
   * Get access token from memory
   * Never store in localStorage for security
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token from memory
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Set tokens in memory (received from backend)
   * Backend should also set httpOnly cookies
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  /**
   * Clear tokens from memory
   * Backend should also clear httpOnly cookies
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Check if user has valid token
   */
  hasToken(): boolean {
    return !!this.accessToken;
  }

  /**
   * Refresh access token using refresh token
   * Uses httpOnly cookie for refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/secure-auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Refresh token is sent via httpOnly cookie
          // No need to send in body
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          this.accessToken = data.accessToken;
          return data.accessToken;
        }
      }
    } catch (error) {
      // Refresh failed
      this.clearTokens();
    }

    return null;
  }

  /**
   * Logout - clear tokens and cookies
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/secure-auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies to clear them
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Even if logout fails, clear local tokens
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Check if token is expired
   * This is a client-side check, server is source of truth
   */
  isTokenExpired(token?: string): boolean {
    const checkToken = token || this.accessToken;
    if (!checkToken) return true;

    try {
      const payload = JSON.parse(atob(checkToken.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Migration helper - gradually move from localStorage to cookies
export const migrateFromLocalStorage = () => {
  const TOKEN_KEY = 'stocker_token';
  const REFRESH_TOKEN_KEY = 'stocker_refresh_token';
  
  // Check if we have tokens in localStorage
  const oldAccessToken = localStorage.getItem(TOKEN_KEY);
  const oldRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  if (oldAccessToken || oldRefreshToken) {
    // Send to backend to set as httpOnly cookies
    fetch(`${API_BASE_URL}/api/auth/migrate-tokens`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': oldAccessToken ? `Bearer ${oldAccessToken}` : '',
      },
      body: JSON.stringify({
        refreshToken: oldRefreshToken,
      }),
    }).then(response => {
      if (response.ok) {
        // Migration successful, remove from localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('last_login_time');
        
        // Also clean up tenant tokens from localStorage
        localStorage.removeItem('X-Tenant-Id');
        localStorage.removeItem('stocker_tenant');
        
        // Keep only non-sensitive data in localStorage
        // Tenant code is okay as it's not sensitive
      }
    }).catch(() => {
      // Migration failed, keep using localStorage for now
    });
  }
};

export default tokenService;