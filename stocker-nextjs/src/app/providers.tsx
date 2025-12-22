'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from '@/lib/auth';
import { TenantProvider } from '@/lib/tenant';
import { ToastProvider } from '@/lib/notifications/toast-provider';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
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
          <App>
            <TenantProvider>
              <AuthProvider>
                <ReCaptchaProvider>
                  <ToastProvider />
                  {children}
                </ReCaptchaProvider>
              </AuthProvider>
            </TenantProvider>
          </App>
        </ConfigProvider>
      </AntdRegistry>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
