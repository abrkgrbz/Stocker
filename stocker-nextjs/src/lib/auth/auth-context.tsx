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

      // If tenant-code cookie exists, user is authenticated
      // (it's set alongside auth-token during login)
      // Create minimal user object - TODO: call /auth/me endpoint when available
      const userData: User = {
        id: 'temp-user-id',
        email: '',
        firstName: 'User',
        lastName: '',
        role: 'User',
        tenantId: '',
        tenantCode: tenantCode,
      };

      console.log('✅ User authenticated (inferred from tenant-code)');
      setUser(userData);
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
