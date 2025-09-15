import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SecureTokenStorage } from './tokenStorage';

describe('SecureTokenStorage', () => {
  let storage: SecureTokenStorage;
  
  beforeEach(() => {
    storage = new SecureTokenStorage();
    // Clear sessionStorage mock
    (global.sessionStorage.getItem as any).mockClear();
    (global.sessionStorage.setItem as any).mockClear();
    (global.sessionStorage.removeItem as any).mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setToken', () => {
    it('should store token in memory and sessionStorage', () => {
      storage.setToken('test-token', 3600);
      
      expect(storage.getToken()).toBe('test-token');
      expect(global.sessionStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        expect.stringContaining('test-token')
      );
    });

    it('should set expiry time correctly', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      storage.setToken('test-token', 3600);
      
      const storedData = JSON.parse(
        (global.sessionStorage.setItem as any).mock.calls[0][1]
      );
      
      expect(storedData.token).toBe('test-token');
      expect(storedData.expiry).toBe(now + 3600 * 1000);
    });

    it('should use default expiry of 1 hour if not specified', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      storage.setToken('test-token');
      
      const storedData = JSON.parse(
        (global.sessionStorage.setItem as any).mock.calls[0][1]
      );
      
      expect(storedData.expiry).toBe(now + 3600 * 1000); // 1 hour default
    });

    it('should handle sessionStorage errors gracefully', () => {
      (global.sessionStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      // Should not throw, just log error
      expect(() => storage.setToken('test-token')).not.toThrow();
      
      // Should still store in memory
      expect(storage.getToken()).toBe('test-token');
    });
  });

  describe('getToken', () => {
    it('should return token from memory if available', () => {
      storage.setToken('memory-token');
      
      // Even if sessionStorage has different value
      (global.sessionStorage.getItem as any).mockReturnValue(
        JSON.stringify({ token: 'session-token', expiry: Date.now() + 1000 })
      );
      
      expect(storage.getToken()).toBe('memory-token');
      expect(global.sessionStorage.getItem).not.toHaveBeenCalled();
    });

    it('should return token from sessionStorage if not in memory', () => {
      const futureTime = Date.now() + 1000;
      (global.sessionStorage.getItem as any).mockReturnValue(
        JSON.stringify({ token: 'session-token', expiry: futureTime })
      );
      
      expect(storage.getToken()).toBe('session-token');
    });

    it('should return null if token is expired', () => {
      const pastTime = Date.now() - 1000;
      (global.sessionStorage.getItem as any).mockReturnValue(
        JSON.stringify({ token: 'expired-token', expiry: pastTime })
      );
      
      expect(storage.getToken()).toBeNull();
      expect(global.sessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return null if sessionStorage data is invalid', () => {
      (global.sessionStorage.getItem as any).mockReturnValue('invalid-json');
      
      expect(storage.getToken()).toBeNull();
    });

    it('should return null if sessionStorage is empty', () => {
      (global.sessionStorage.getItem as any).mockReturnValue(null);
      
      expect(storage.getToken()).toBeNull();
    });
  });

  describe('clearToken', () => {
    it('should clear token from both memory and sessionStorage', () => {
      storage.setToken('test-token');
      storage.clearToken();
      
      expect(storage.getToken()).toBeNull();
      expect(global.sessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should handle sessionStorage errors gracefully', () => {
      (global.sessionStorage.removeItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      storage.setToken('test-token');
      
      // Should not throw
      expect(() => storage.clearToken()).not.toThrow();
      
      // Should still clear from memory
      expect(storage.getToken()).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true if no token exists', () => {
      expect(storage.isTokenExpired()).toBe(true);
    });

    it('should return true if token is expired', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      storage.setToken('test-token', 1); // 1 second expiry
      
      vi.setSystemTime(now + 2000); // Advance 2 seconds
      
      expect(storage.isTokenExpired()).toBe(true);
    });

    it('should return false if token is still valid', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      storage.setToken('test-token', 3600); // 1 hour expiry
      
      vi.setSystemTime(now + 1000); // Advance 1 second
      
      expect(storage.isTokenExpired()).toBe(false);
    });
  });

  describe('getTokenExpiry', () => {
    it('should return null if no token exists', () => {
      expect(storage.getTokenExpiry()).toBeNull();
    });

    it('should return expiry time if token exists', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      storage.setToken('test-token', 3600);
      
      expect(storage.getTokenExpiry()).toBe(now + 3600 * 1000);
    });
  });
});