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
      // Call logout endpoint - backend will clear HttpOnly cookies
      await ApiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ NO COOKIE CLEARING - Backend handles HttpOnly cookies
      setUser(null);

      // Redirect to auth subdomain for login
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        router.push('/login');
      }
    }
  };

  const refreshUser = async () => {
    try {
      // Check if auth-token cookie exists
      const authTokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));

      if (!authTokenCookie) {
        console.log('No auth-token cookie found');
        setUser(null);
        return;
      }

      // Extract JWT token value
      const token = authTokenCookie.split('=')[1];

      if (!token) {
        console.log('Auth token cookie exists but is empty');
        setUser(null);
        return;
      }

      console.log('Auth token exists, decoding JWT...');

      // Decode JWT to get user info (temporary until /auth/me endpoint is ready)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // Map JWT claims to User interface
        const userData: User = {
          id: payload.nameid || '',
          email: payload.email || '',
          firstName: payload.given_name || 'User',
          lastName: payload.family_name || '',
          role: payload.role || '',
          tenantId: payload.tenantid || '',
          tenantCode: payload.tenantcode || '',
        };

        console.log('✅ User loaded from JWT:', userData);
        setUser(userData);
      } catch (parseError) {
        console.error('Failed to parse JWT:', parseError);
        // Fallback: try /auth/me endpoint
        const userData = await ApiService.get<User>('/auth/me');
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
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
