'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenantCode?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  tenantIdentifier?: string;
}

interface RegisterData {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user from HttpOnly cookie on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // ✅ Try to load user from HttpOnly cookie
      // If cookie exists, /auth/me will succeed
      await refreshUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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
      console.error('Login failed:', error);
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
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');

      // Call logout endpoint - backend will revoke refresh tokens
      await ApiService.post('/auth/logout');

      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Continue with client-side cleanup even if API fails
    } finally {
      // Clear user state
      setUser(null);

      // ✅ KEEP tenant-code cookie for easy re-login on same subdomain
      // Only clear auth-related cookies (HttpOnly cookies cleared by backend)

      // Clear any localStorage auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tenantId');
        localStorage.removeItem('tenantIdentifier');
        console.log('🧹 Cleared localStorage auth data');
      }

      console.log('🍪 Tenant-code cookie preserved for re-login');

      // Stay on same subdomain for re-login
      router.push('/login');

      console.log('✅ Logout complete - redirecting to /login');
    }
  };

  // Helper function to decode JWT token (only the payload, not verifying signature)
  const decodeJwtPayload = (token: string): any => {
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
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔍 Checking authentication...');
      console.log('📋 Readable cookies:', document.cookie);

      // Note: auth-token is httpOnly so we can't read it with document.cookie
      // But tenant-code is NOT httpOnly, so we can use it as an auth indicator
      const tenantCodeCookie = document.cookie.split(';').find(c => c.trim().startsWith('tenant-code='));

      if (!tenantCodeCookie) {
        console.log('❌ No tenant-code cookie - user not authenticated');
        setUser(null);
        return;
      }

      const tenantCode = tenantCodeCookie.split('=')[1];
      console.log('✅ Found tenant-code cookie:', tenantCode);

      // Try to get JWT token from cookie (even though it's httpOnly, some browsers allow reading)
      // If not available, we'll rely on /auth/me endpoint
      const authTokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
      let jwtPayload = null;

      if (authTokenCookie) {
        const token = authTokenCookie.split('=')[1];
        jwtPayload = decodeJwtPayload(token);
        console.log('🔓 Decoded JWT payload:', jwtPayload);
      }

      // Fetch real user data from /auth/me endpoint
      console.log('📡 Fetching user data from /auth/me...');
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
          console.warn('⚠️ /auth/me endpoint returned:', response.status);

          // Fallback to temp user if endpoint not available yet (401/404)
          if (response.status === 401 || response.status === 404) {
            console.log('📝 Using fallback user from JWT (endpoint not deployed yet)');
            const userData: User = {
              id: jwtPayload?.nameid || 'temp-user-id',
              email: jwtPayload?.email || '',
              firstName: jwtPayload?.unique_name?.split('-')[0] || 'User',
              lastName: '',
              role: jwtPayload?.role || 'User',
              tenantId: jwtPayload?.TenantId || '',
              tenantCode: jwtPayload?.TenantName || tenantCode,
            };
            console.log('✅ User from JWT:', userData);
            setUser(userData);
            return;
          }

          setUser(null);
          return;
        }

        const result = await response.json();
        console.log('📋 User data response:', result);

        if (result.success && result.data) {
          const userData: User = {
            id: result.data.id,
            email: result.data.email,
            firstName: result.data.fullName?.split(' ')[0] || '',
            lastName: result.data.fullName?.split(' ').slice(1).join(' ') || '',
            role: result.data.roles?.[0] || result.data.role || jwtPayload?.role || 'User',
            tenantId: result.data.tenantId || '',
            tenantCode: result.data.tenantCode || tenantCode,
          };

          console.log('✅ User authenticated with real data:', userData);
          setUser(userData);
        } else {
          console.error('❌ Invalid user data response');
          setUser(null);
        }
      } catch (fetchError) {
        console.warn('⚠️ /auth/me fetch failed, using fallback from JWT:', fetchError);
        // Fallback to user data from JWT on network error
        const userData: User = {
          id: jwtPayload?.nameid || 'temp-user-id',
          email: jwtPayload?.email || '',
          firstName: jwtPayload?.unique_name?.split('-')[0] || 'User',
          lastName: '',
          role: jwtPayload?.role || 'User',
          tenantId: jwtPayload?.TenantId || '',
          tenantCode: jwtPayload?.TenantName || tenantCode,
        };
        console.log('✅ User from JWT fallback:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      // ✅ NO COOKIE CLEARING - Just clear user state
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
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
