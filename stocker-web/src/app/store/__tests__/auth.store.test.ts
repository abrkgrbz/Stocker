import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '../auth.store';

// Mock the auth API module
vi.mock('@/shared/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

// Mock the auth-interceptor utils
vi.mock('@/shared/utils/auth-interceptor', () => ({
  isTokenExpired: vi.fn(() => false),
  resetSessionTimeout: vi.fn(),
}));

// Import the mocked module
import { authApi } from '@/shared/api/auth.api';
const mockedAuthApi = authApi as any;

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Reset localStorage
    localStorage.clear();
    
    // Reset the auth store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      lastActivity: Date.now(),
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Login', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            userName: 'testuser',
            tenantId: 'tenant-123',
            roles: ['User']
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      mockedAuthApi.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password',
          tenantCode: 'TEST'
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.token).toBe('mock-token');
      expect(localStorage.getItem('stocker_token')).toBe('mock-token');
      expect(localStorage.getItem('stocker_refresh_token')).toBe('mock-refresh-token');
    });

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            errors: {
              General: ['Invalid credentials']
            }
          }
        }
      };
      
      mockedAuthApi.login.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      // The login method throws an error, so we need to catch it
      await act(async () => {
        try {
          await result.current.login({
            email: 'test@example.com',
            password: 'wrongpassword',
            tenantCode: 'TEST'
          });
        } catch (error) {
          // Expected error, ignore it
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
    });

    it('should set loading state during login', async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      
      mockedAuthApi.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isLoading).toBe(false);

      // Start login without awaiting
      act(() => {
        result.current.login({
          email: 'test@example.com',
          password: 'password',
          tenantCode: 'TEST'
        });
      });

      // Check loading state immediately after starting login
      expect(result.current.isLoading).toBe(true);

      // Resolve the login
      act(() => {
        resolveLogin({
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'token',
            refreshToken: 'refresh'
          }
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Logout', () => {
    it('should clear user data on logout', async () => {
      mockedAuthApi.logout.mockResolvedValue({});

      const { result } = renderHook(() => useAuthStore());

      // First set a user
      act(() => {
        useAuthStore.setState({
          user: {
            id: '123',
            email: 'test@example.com',
            userName: 'testuser',
            tenantId: 'tenant-123',
            roles: ['User']
          },
          token: 'test-token',
          isAuthenticated: true,
          isInitialized: true
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('stocker_token')).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-token',
          refreshToken: 'new-refresh-token'
        }
      };

      mockedAuthApi.refreshToken.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());
      
      // Set initial state with refresh token
      act(() => {
        useAuthStore.setState({
          refreshToken: 'old-refresh-token'
        });
      });

      await act(async () => {
        await result.current.refreshAuthToken();
      });

      expect(result.current.token).toBe('new-token');
      expect(result.current.refreshToken).toBe('new-refresh-token');
      expect(localStorage.getItem('stocker_token')).toBe('new-token');
      expect(localStorage.getItem('stocker_refresh_token')).toBe('new-refresh-token');
    });

    it('should logout if refresh token fails', async () => {
      mockedAuthApi.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));
      mockedAuthApi.logout.mockResolvedValue({});

      const { result } = renderHook(() => useAuthStore());
      
      // Set initial authenticated state
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          refreshToken: 'old-refresh-token'
        });
      });

      await act(async () => {
        await result.current.refreshAuthToken();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });
  });

  describe('Check Auth', () => {
    it('should check auth from stored token', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        userName: 'testuser',
        tenantId: 'tenant-123',
        roles: ['User']
      };

      localStorage.setItem('stocker_token', 'valid-token');
      mockedAuthApi.getCurrentUser.mockResolvedValue({
        data: mockUser
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('valid-token');
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle check auth without token', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should handle check auth error', async () => {
      localStorage.setItem('stocker_token', 'invalid-token');
      mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(localStorage.getItem('stocker_token')).toBeNull();
    });
  });

  describe('Initialize Auth', () => {
    it('should initialize auth when user and token exist', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Set initial state with user and token
      act(() => {
        useAuthStore.setState({
          user: {
            id: '123',
            email: 'test@example.com',
            userName: 'testuser',
            tenantId: 'tenant-123',
            roles: ['User']
          },
          token: 'valid-token'
        });
      });

      act(() => {
        result.current.initializeAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isInitialized).toBe(true);
    });

    it('should initialize without token', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initializeAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Set an error
      act(() => {
        useAuthStore.setState({
          error: 'Test error'
        });
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Tenant Management', () => {
    it('should set tenant', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setTenant('tenant-456');
      });

      expect(localStorage.getItem('stocker_tenant')).toBe('tenant-456');
    });
  });

  describe('Activity Tracking', () => {
    it('should update activity', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const initialActivity = result.current.lastActivity;

      // Wait a bit to ensure time has passed
      setTimeout(() => {
        act(() => {
          result.current.updateActivity();
        });

        expect(result.current.lastActivity).toBeGreaterThan(initialActivity);
      }, 10);
    });
  });
});