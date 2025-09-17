import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ProConfigProvider } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ConfigProvider } from 'antd';

import { TenantProvider } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantProvider>
          <ThemeProvider>
            <ConfigProvider>
              <ProConfigProvider>
                {children}
              </ProConfigProvider>
            </ConfigProvider>
          </ThemeProvider>
        </TenantProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities
export const createMockUser = () => ({
  id: 'test-user-id',
  userName: 'testuser',
  email: 'test@example.com',
  tenantId: 'test-tenant',
  roles: ['User'],
  firstName: 'Test',
  lastName: 'User',
});

export const createMockTenant = () => ({
  id: 'test-tenant',
  name: 'Test Tenant',
  subdomain: 'test',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as any,
});

// Mock localStorage helper
export const mockLocalStorage = (data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

// Mock sessionStorage helper
export const mockSessionStorage = (data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    sessionStorage.setItem(key, value);
  });
};