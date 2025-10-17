'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api';
import { cookieStorage } from './cookie-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
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

  // Load user from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = cookieStorage.getItem('accessToken');
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await ApiService.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', credentials);

      // Store tokens in cookies (works across subdomains)
      cookieStorage.setItem('accessToken', response.accessToken);
      cookieStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await ApiService.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/api/public/tenant-registration/register', data);

      // Store tokens in cookies (works across subdomains)
      cookieStorage.setItem('accessToken', response.accessToken);
      cookieStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await ApiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear cookies
      cookieStorage.removeItem('accessToken');
      cookieStorage.removeItem('refreshToken');
      setUser(null);

      // Redirect to login
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await ApiService.get<User>('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Clear invalid session
      cookieStorage.removeItem('accessToken');
      cookieStorage.removeItem('refreshToken');
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
