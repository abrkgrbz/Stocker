'use client';

/**
 * =====================================
 * APPLICATION PROVIDERS
 * =====================================
 *
 * Central provider composition with:
 * - React Query for server state management
 * - Ant Design with enterprise theme system (Light mode only)
 * - Authentication and tenant context
 * - Toast notifications
 * - reCAPTCHA integration
 */

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ToastProvider } from '@/lib/notifications/toast-provider';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import { SessionExpiryWarning } from '@/components/session/SessionExpiryWarning';
import { lightTheme } from '@/theme';

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
// THEME CONTEXT (Simplified - Light mode only)
// =====================================

interface ThemeContextValue {
  mode: 'light';
  isDark: false;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  isDark: false,
});

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

// =====================================
// THEME PROVIDER (Light mode only)
// =====================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo(
    () => ({
      mode: 'light' as const,
      isDark: false as const,
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider locale={trTR} theme={lightTheme}>
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
                <SessionExpiryWarning />
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
