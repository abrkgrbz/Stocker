'use client';

/**
 * =====================================
 * APPLICATION PROVIDERS
 * =====================================
 *
 * Central provider composition with:
 * - React Query for server state management
 * - Ant Design with enterprise theme system
 * - Authentication and tenant context
 * - Toast notifications
 * - reCAPTCHA integration
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ToastProvider } from '@/lib/notifications/toast-provider';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import {
  lightTheme,
  darkTheme,
  type ThemeMode,
  getStoredThemeMode,
  setStoredThemeMode,
  getSystemThemeMode,
} from '@/theme';

// =====================================
// REACT QUERY CONFIGURATION
// =====================================

/**
 * React Query Global Configuration
 * Optimized to prevent 429 (Too Many Requests) errors
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache & Stale Settings - Aggressive caching to reduce API calls
      staleTime: 3 * 60 * 1000, // 3 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache after unmount

      // Refetch Behavior - Minimize automatic refetches
      refetchOnWindowFocus: false, // Don't refetch when tab gains focus
      refetchOnReconnect: false, // Don't refetch on network reconnect
      refetchOnMount: false, // Don't refetch if data exists and not stale
      refetchInterval: false, // No polling

      // Retry Settings - Let API client handle retries
      retry: false, // API client has its own retry with exponential backoff

      // Network Mode
      networkMode: 'offlineFirst', // Use cached data first, then fetch
    },
    mutations: {
      // Mutations don't need retry - API client handles it
      retry: false,
    },
  },
});

// =====================================
// THEME CONTEXT
// =====================================

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// =====================================
// THEME PROVIDER
// =====================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage/system on mount
  useEffect(() => {
    const stored = getStoredThemeMode();
    if (stored) {
      setModeState(stored);
    } else {
      const system = getSystemThemeMode();
      setModeState(system);
    }
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference
      if (!getStoredThemeMode()) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredThemeMode(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isDark: mode === 'dark',
    }),
    [mode, setMode, toggleMode]
  );

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  // Prevent flash of incorrect theme on SSR
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>
        <ConfigProvider locale={trTR} theme={lightTheme}>
          {children}
        </ConfigProvider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider locale={trTR} theme={theme}>
        <AntdApp>
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

// =====================================
// MAIN PROVIDERS COMPONENT
// =====================================

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ThemeProvider>
          <TenantProvider>
            <AuthProvider>
              <ReCaptchaProvider>
                <ToastProvider />
                {children}
              </ReCaptchaProvider>
            </AuthProvider>
          </TenantProvider>
        </ThemeProvider>
      </AntdRegistry>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
