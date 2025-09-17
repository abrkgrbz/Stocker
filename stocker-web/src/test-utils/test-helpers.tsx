import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import trTR from 'antd/locale/tr_TR'


import { ThemeProvider } from '@/contexts/ThemeContext'

const MockTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

// Create a custom render function that includes all providers
interface AllProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export const AllProviders: React.FC<AllProvidersProps> = ({ 
  children, 
  queryClient = createQueryClient() 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={trTR}>
          <ThemeProvider>
            <MockTenantProvider>
              {children}
            </MockTenantProvider>
          </ThemeProvider>
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Custom render with all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const { queryClient, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  })
}

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenantId: '1',
  ...overrides,
})

export const mockTenant = (overrides = {}) => ({
  id: '1',
  name: 'Test Company',
  subdomain: 'test',
  isActive: true,
  settings: {
    theme: 'light',
    locale: 'tr-TR',
    currency: 'TRY',
    ...(overrides as any).settings,
  },
  ...overrides,
})

export const mockAuthResponse = (overrides = {}) => ({
  token: 'test-jwt-token',
  refreshToken: 'test-refresh-token',
  user: mockUser(),
  expiresIn: 3600,
  ...overrides,
})

// API mock helpers
export const mockApiSuccess = (data: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay)
  })
}

export const mockApiError = (message = 'API Error', status = 400, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject({
      response: {
        status,
        data: { message },
      },
    }), delay)
  })
}

// Wait helpers
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// Local storage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Session storage mock
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Setup storage mocks
export const setupStorageMocks = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true,
  })
  
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage(),
    writable: true,
  })
}

// Form data helper
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })
  return formData
}

// Table test helpers
export const getTableRows = (container: HTMLElement) => {
  return container.querySelectorAll('tbody tr')
}

export const getTableHeaders = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll('thead th')).map(th => th.textContent)
}

// Accessibility test helpers
export const checkA11y = async (container: HTMLElement) => {
  // Skip for now since jest-axe is not installed
  return Promise.resolve()
}

// Export everything
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'