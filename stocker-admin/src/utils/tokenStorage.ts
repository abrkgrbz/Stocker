/**
 * Secure token storage utility
 * Uses memory storage with sessionStorage fallback
 * Prevents XSS attacks by avoiding localStorage
 */

class SecureTokenStorage {
  private memoryToken: string | null = null;
  private memoryRefreshToken: string | null = null;
  private readonly SESSION_KEY = 'auth_session';
  private readonly REFRESH_KEY = 'auth_refresh';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  /**
   * Store token securely
   * Prefers memory storage, falls back to sessionStorage
   */
  setToken(token: string, expiresIn: number = 3600): void {
    // Store in memory (most secure)
    this.memoryToken = token;
    
    // Store in sessionStorage as fallback (safer than localStorage)
    // SessionStorage is cleared when tab closes
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const expiry = Date.now() + (expiresIn * 1000);
        sessionStorage.setItem(this.SESSION_KEY, token);
        sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
      } catch (e) {
        console.warn('SessionStorage not available:', e);
      }
    }
  }

  /**
   * Get token from storage
   * Checks expiry and clears if expired
   */
  getToken(): string | null {
    // First check memory
    if (this.memoryToken) {
      return this.memoryToken;
    }

    // Fallback to sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const token = sessionStorage.getItem(this.SESSION_KEY);
        const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
        
        if (token && expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            this.memoryToken = token; // Cache in memory
            return token;
          } else {
            // Token expired, clear it
            this.clearToken();
          }
        }
      } catch (e) {
        console.warn('Error reading from sessionStorage:', e);
      }
    }

    return null;
  }

  /**
   * Store refresh token
   */
  setRefreshToken(refreshToken: string): void {
    this.memoryRefreshToken = refreshToken;
    
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
      } catch (e) {
        console.warn('SessionStorage not available for refresh token:', e);
      }
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (this.memoryRefreshToken) {
      return this.memoryRefreshToken;
    }

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
        if (refreshToken) {
          this.memoryRefreshToken = refreshToken;
          return refreshToken;
        }
      } catch (e) {
        console.warn('Error reading refresh token:', e);
      }
    }

    return null;
  }

  /**
   * Clear token from all storage
   */
  clearToken(): void {
    this.memoryToken = null;
    this.memoryRefreshToken = null;
    
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.REFRESH_KEY);
        sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      } catch (e) {
        console.warn('Error clearing sessionStorage:', e);
      }
    }

    // Also clear any legacy localStorage tokens
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      } catch (e) {
        // Ignore errors
      }
    }
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Refresh token expiry without changing token
   */
  refreshExpiry(expiresIn: number = 3600): void {
    if (this.memoryToken && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const expiry = Date.now() + (expiresIn * 1000);
        sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
      } catch (e) {
        console.warn('Error refreshing token expiry:', e);
      }
    }
  }
}

// Export singleton instance
export const tokenStorage = new SecureTokenStorage();

// Export for testing
export default SecureTokenStorage;