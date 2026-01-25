'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';
import logger from '@/lib/utils/logger';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  tenantId: string;
  tenantCode?: string;
  /**
   * User permissions in format "Resource:PermissionType" (e.g., "CRM:View", "Users:Edit")
   */
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantIdentifier?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantIdentifier?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /**
   * Refresh the session by calling the refresh-token endpoint
   * Used by SessionExpiryWarning to extend the session
   */
  refreshSession: () => Promise<void>;
  /**
   * Check if user has a specific permission
   * @param resource The resource name (e.g., "CRM", "Users")
   * @param permissionType The permission type (e.g., "View", "Edit", "Create", "Delete")
   */
  hasPermission: (resource: string, permissionType: string) => boolean;
  /**
   * Check if user has any of the specified permissions
   * @param permissions Array of permission strings in format "Resource:PermissionType"
   */
  hasAnyPermission: (permissions: string[]) => boolean;
  /**
   * Check if user can access a module (has at least View permission)
   * @param moduleName The module name (e.g., "CRM", "HR", "Inventory")
   */
  canAccessModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Dev bypass mock user - only used when NEXT_PUBLIC_AUTH_BYPASS=true
const DEV_MOCK_USER: User = {
  id: 'dev-user-id',
  email: 'dev@stocker.local',
  firstName: 'Dev',
  lastName: 'User',
  role: 'SistemYoneticisi',
  roles: ['Admin', 'FirmaYoneticisi', 'SistemYoneticisi'],
  tenantId: 'dev-tenant-id',
  tenantCode: 'dev',
  permissions: [], // Dev user has no permission restrictions in bypass mode
};

export function AuthProvider({ children }: AuthProviderProps) {
  // Check for auth bypass in development
  // const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
  const isAuthBypassed = true; // Forced for local debugging
  console.log('[AuthContext] Forced Bypass:', isAuthBypassed);

  const [user, setUser] = useState<User | null>(isAuthBypassed ? DEV_MOCK_USER : null);
  const [isLoading, setIsLoading] = useState(!isAuthBypassed);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user from HttpOnly cookie on mount
  useEffect(() => {
    // Skip auth check if bypassed
    if (isAuthBypassed) {
      logger.debug('Auth bypassed - using dev mock user', { component: 'AuthContext' });
      return;
    }

    const initializeAuth = async () => {
      // ✅ Try to load user from HttpOnly cookie
      // If cookie exists, /auth/me will succeed
      await refreshUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, [isAuthBypassed]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: {
          user: User;
        };
      }>('/auth/login', credentials);

      // ✅ NO TOKEN STORAGE - Backend sets HttpOnly cookies automatically
      // Just load user data
      await refreshUser(); // Load fresh user data with cookie

      // Redirect to tenant subdomain dashboard if tenantCode exists
      if (response.data.user.tenantCode) {
        const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
        if (isProduction) {
          window.location.href = `https://${response.data.user.tenantCode}.stoocker.app/dashboard`;
        } else {
          // For development, redirect to /dashboard on auth subdomain
          router.push('/dashboard');
        }
      } else {
        // No tenant, redirect to regular dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      logger.error('Login failed', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await ApiService.post<{
        user: User;
      }>('/api/public/tenant-registration/register', data);

      // ✅ NO TOKEN STORAGE - Backend sets HttpOnly cookies automatically
      await refreshUser(); // Load fresh user data with cookie

      // Redirect to tenant subdomain dashboard if tenantCode exists
      if (response.user.tenantCode) {
        const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
        if (isProduction) {
          window.location.href = `https://${response.user.tenantCode}.stoocker.app/dashboard`;
        } else {
          // For development, redirect to /dashboard on auth subdomain
          router.push('/dashboard');
        }
      } else {
        // No tenant, redirect to regular dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      logger.error('Registration failed', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      logger.info('Logging out', { component: 'AuthContext' });

      // Call logout endpoint - backend will revoke refresh tokens
      await ApiService.post('/auth/logout');

      logger.debug('Logout API call successful', { component: 'AuthContext' });
    } catch (error) {
      logger.error('Logout API error', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      // Continue with client-side cleanup even if API fails
    } finally {
      // Clear user state
      setUser(null);

      // Clear ALL cookies (including tenant-code for full logout)
      if (typeof window !== 'undefined') {
        // Get all cookies and clear them
        const cookies = document.cookie.split(';');
        const domain = window.location.hostname;
        const baseDomain = domain.includes('stoocker.app') ? '.stoocker.app' : domain;

        cookies.forEach(cookie => {
          const cookieName = cookie.split('=')[0].trim();
          // Clear cookie for current domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          // Clear cookie for base domain (e.g., .stoocker.app)
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${baseDomain}`;
        });

        // Clear localStorage
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantIdentifier');
        localStorage.removeItem('requiresSetup');

        // Clear sessionStorage
        sessionStorage.clear();

        logger.debug('Cleared cookies and storage', { component: 'AuthContext' });
      }

      // Redirect to auth subdomain login page in production
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        logger.info('Logout complete - redirecting to auth.stoocker.app/login', { component: 'AuthContext' });
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        logger.info('Logout complete - redirecting to /login', { component: 'AuthContext' });
        router.push('/login');
      }
    }
  };

  const refreshSession = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session refresh failed');
      }

      // Refresh user data after token renewal
      await refreshUser();
      logger.info('Session refreshed successfully', { component: 'AuthContext' });
    } catch (error) {
      logger.error('Failed to refresh session', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      throw error;
    }
  };

  // Helper function to decode JWT token (only the payload, not verifying signature)
  const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      logger.error('Failed to decode JWT', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      logger.debug('Checking authentication', { component: 'AuthContext' });

      // Note: auth-token is httpOnly so we can't read it with document.cookie
      // But tenant-code is NOT httpOnly, so we can use it as an auth indicator
      const tenantCodeCookie = document.cookie.split(';').find(c => c.trim().startsWith('tenant-code='));

      if (!tenantCodeCookie) {
        logger.debug('No tenant-code cookie - user not authenticated', { component: 'AuthContext' });
        setUser(null);
        return;
      }

      const tenantCode = tenantCodeCookie.split('=')[1];
      logger.debug('Found tenant-code cookie', { component: 'AuthContext', metadata: { tenantCode } });

      // Try to get JWT token from cookie (even though it's httpOnly, some browsers allow reading)
      // If not available, we'll rely on /auth/me endpoint
      const authTokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
      let jwtPayload: Record<string, unknown> | null = null;

      if (authTokenCookie) {
        const token = authTokenCookie.split('=')[1];
        jwtPayload = decodeJwtPayload(token);
        logger.debug('Decoded JWT payload', { component: 'AuthContext' });
      }

      // Fetch real user data from /auth/me endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Code': tenantCode,
          },
          credentials: 'include', // Send cookies
        });

        if (!response.ok) {
          logger.warn('/auth/me endpoint returned error', { component: 'AuthContext', metadata: { status: response.status } });

          // 401 = Unauthorized - token is invalid or expired
          if (response.status === 401) {
            logger.warn('Token invalid or expired - clearing auth state', { component: 'AuthContext' });
            setUser(null);
            return;
          }

          // 404 = Endpoint not available - try fallback to JWT only in development
          if (response.status === 404 && process.env.NODE_ENV === 'development' && jwtPayload) {
            // Extract permissions from JWT if available
            const jwtPermissions = Array.isArray(jwtPayload?.Permission)
              ? jwtPayload.Permission as string[]
              : jwtPayload?.Permission
                ? [jwtPayload.Permission as string]
                : [];
            const jwtRoles = Array.isArray(jwtPayload?.role)
              ? jwtPayload.role as string[]
              : jwtPayload?.role
                ? [jwtPayload.role as string]
                : [];
            const userData: User = {
              id: (jwtPayload?.nameid as string) || 'temp-user-id',
              email: (jwtPayload?.email as string) || '',
              firstName: ((jwtPayload?.unique_name as string)?.split('-')[0]) || 'User',
              lastName: '',
              role: jwtRoles[0] || 'User',
              roles: jwtRoles,
              tenantId: (jwtPayload?.TenantId as string) || '',
              tenantCode: (jwtPayload?.TenantName as string) || tenantCode,
              permissions: jwtPermissions,
            };
            logger.debug('Using fallback user from JWT (dev mode, 404)', { component: 'AuthContext' });
            setUser(userData);
            return;
          }

          setUser(null);
          return;
        }

        const result = await response.json();

        if (result.success && result.data) {
          const userData: User = {
            id: result.data.id,
            email: result.data.email,
            firstName: result.data.fullName?.split(' ')[0] || '',
            lastName: result.data.fullName?.split(' ').slice(1).join(' ') || '',
            role: result.data.roles?.[0] || result.data.role || (jwtPayload?.role as string) || 'User',
            roles: result.data.roles || [],
            tenantId: result.data.tenantId || '',
            tenantCode: result.data.tenantCode || tenantCode,
            permissions: result.data.permissions || [],
          };

          logger.info('User authenticated', { component: 'AuthContext', userId: userData.id, metadata: { permissionsCount: userData.permissions?.length } });
          setUser(userData);
        } else {
          logger.error('Invalid user data response', new Error('Invalid response format'), { component: 'AuthContext' });
          setUser(null);
        }
      } catch (fetchError) {
        logger.warn('/auth/me fetch failed, using fallback from JWT', { component: 'AuthContext' });
        // Extract permissions from JWT if available
        const jwtPermissions = Array.isArray(jwtPayload?.Permission)
          ? jwtPayload.Permission as string[]
          : jwtPayload?.Permission
            ? [jwtPayload.Permission as string]
            : [];
        const jwtRoles = Array.isArray(jwtPayload?.role)
          ? jwtPayload.role as string[]
          : jwtPayload?.role
            ? [jwtPayload.role as string]
            : [];
        // Fallback to user data from JWT on network error
        const userData: User = {
          id: (jwtPayload?.nameid as string) || 'temp-user-id',
          email: (jwtPayload?.email as string) || '',
          firstName: ((jwtPayload?.unique_name as string)?.split('-')[0]) || 'User',
          lastName: '',
          role: jwtRoles[0] || 'User',
          roles: jwtRoles,
          tenantId: (jwtPayload?.TenantId as string) || '',
          tenantCode: (jwtPayload?.TenantName as string) || tenantCode,
          permissions: jwtPermissions,
        };
        setUser(userData);
      }
    } catch (error) {
      logger.error('Failed to refresh user', error instanceof Error ? error : new Error(String(error)), { component: 'AuthContext' });
      // NO COOKIE CLEARING - Just clear user state
      setUser(null);
    }
  };

  // Permission helper functions
  const hasPermission = (resource: string, permissionType: string): boolean => {
    // Auth bypass mode - allow everything
    if (isAuthBypassed) return true;

    // Check if user is a system admin (FirmaYoneticisi or SistemYoneticisi has all permissions)
    if (user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi')) {
      return true;
    }

    const permissionString = `${resource}:${permissionType}`;
    return user?.permissions?.includes(permissionString) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    // Auth bypass mode - allow everything
    if (isAuthBypassed) return true;

    // Check if user is a system admin
    if (user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi')) {
      return true;
    }

    return permissions.some(p => user?.permissions?.includes(p) ?? false);
  };

  const canAccessModule = (moduleName: string): boolean => {
    // Auth bypass mode - allow everything
    if (isAuthBypassed) return true;

    // Check if user is a system admin
    if (user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi')) {
      return true;
    }

    // Check if user has at least View permission for the module
    const viewPermission = `${moduleName}:View`;
    return user?.permissions?.includes(viewPermission) ?? false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    refreshSession,
    hasPermission,
    hasAnyPermission,
    canAccessModule,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
