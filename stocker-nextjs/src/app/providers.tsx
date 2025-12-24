'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ToastProvider } from '@/lib/notifications/toast-provider';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ConfigProvider
          locale={trTR}
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <TenantProvider>
            <AuthProvider>
              <ReCaptchaProvider>
                <ToastProvider />
                {children}
              </ReCaptchaProvider>
            </AuthProvider>
          </TenantProvider>
        </ConfigProvider>
      </AntdRegistry>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
