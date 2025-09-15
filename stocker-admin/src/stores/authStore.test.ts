import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from './authStore';
import { tokenStorage } from '../utils/tokenStorage';
import { envValidator } from '../utils/envValidator';
import { auditLogger } from '../utils/auditLogger';

// Mock modules
vi.mock('../utils/tokenStorage', () => ({
  tokenStorage: {
    setToken: vi.fn(),
    getToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

vi.mock('../utils/envValidator', () => ({
  envValidator: {
    getApiUrl: vi.fn(() => 'http://localhost:5000'),
  },
}));

vi.mock('../utils/auditLogger', () => ({
  auditLogger: {
    logLogin: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('authStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'test-token-123',
          user: {
            id: '1',
            email: 'admin@test.com',
            fullName: 'Admin User',
            roles: ['SystemAdmin'],
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { login } = useAuthStore.getState();
      await login('admin@test.com', 'password123');

      const state = useAuthStore.getState();
      
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('test-token-123');
      expect(state.user).toEqual({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'super_admin',
      });
      
      expect(tokenStorage.setToken).toHaveBeenCalledWith('test-token-123', 3600);
      expect(auditLogger.logLogin).toHaveBeenCalledWith('admin@test.com', true);
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      });

      const { login } = useAuthStore.getState();
      
      await expect(login('admin@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      
      expect(auditLogger.logLogin).toHaveBeenCalledWith('admin@test.com', false, 'Invalid credentials');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { login } = useAuthStore.getState();
      
      await expect(login('admin@test.com', 'password123')).rejects.toThrow('Network error');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(auditLogger.logLogin).toHaveBeenCalledWith('admin@test.com', false, 'Network error');
    });

    it('should map regular admin role correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'test-token-456',
          user: {
            id: '2',
            email: 'admin@test.com',
            username: 'Admin',
            roles: ['Admin'], // Not SystemAdmin
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { login } = useAuthStore.getState();
      await login('admin@test.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user?.role).toBe('admin'); // Regular admin, not super_admin
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'super_admin',
        },
        accessToken: 'test-token',
        isAuthenticated: true,
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(tokenStorage.clearToken).toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should set isAuthenticated to false if no token exists', () => {
      (tokenStorage.getToken as any).mockReturnValue(null);
      
      const { checkAuth } = useAuthStore.getState();
      checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should restore token from secure storage', () => {
      (tokenStorage.getToken as any).mockReturnValue('stored-token');
      
      useAuthStore.setState({
        accessToken: null,
        isAuthenticated: false,
      });
      
      const { checkAuth } = useAuthStore.getState();
      checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('stored-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should maintain authenticated state if token exists in state', () => {
      (tokenStorage.getToken as any).mockReturnValue('stored-token');
      
      useAuthStore.setState({
        accessToken: 'state-token',
        isAuthenticated: true,
      });
      
      const { checkAuth } = useAuthStore.getState();
      checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('state-token'); // Should keep state token
      expect(state.isAuthenticated).toBe(true);
    });
  });
});