import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';

import { AppRouter } from '@/app/router/AppRouter';
import { useAuthStore } from '@/app/store/auth.store';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { TenantProvider, useTenant } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import InvalidTenantPage from '@/features/error/pages/InvalidTenantPage';
import { analytics } from '@/services/analytics';
import { initSentry, setUser, trackPageView } from '@/services/monitoring';
import { initWebVitals } from '@/services/web-vitals';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { PageLoader } from '@/shared/components/PageLoader';

dayjs.locale('tr');

// Initialize monitoring services
if (import.meta.env.PROD) {
  initSentry();
  initWebVitals();
  
  analytics.initialize({
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.DEV,
  });
}

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

function App() {
  const { initializeAuth, isInitialized, isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Set user for monitoring
    if (user) {
      setUser({
        id: user.id,
        email: user.email,
        username: user.userName,
        tenant: user.tenantId,
      });
      
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        tenant: user.tenantId,
        roles: user.roles?.join(','),
      });
    } else {
      setUser(null);
      analytics.setUserId(null);
    }
  }, [user]);
  
  useEffect(() => {
    // Initialize auth state on app load
    // Only run once on mount, not on every render
    if (!isInitialized) {
      initializeAuth();
    }
  }, []); // Empty dependency array - only run on mount

  // Auth state monitoring removed - no longer needed for production

  // Show loading spinner while checking initial auth state
  if (!isInitialized || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <ConfigProvider>
          <AntApp>
            <Spin size="large" />
          </AntApp>
        </ConfigProvider>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <ThemeProvider>
            <ConfigProvider
            locale={trTR}
            theme={{
            token: {
              colorPrimary: '#667eea',
              borderRadius: 8,
              colorLink: '#667eea',
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#ff4d4f',
              fontSize: 14,
              colorBgContainer: '#ffffff',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            },
            components: {
              Button: {
                controlHeight: 40,
                borderRadius: 8,
              },
              Input: {
                controlHeight: 40,
                borderRadius: 8,
            },
            Card: {
              borderRadius: 12,
            },
          },
        }}
      >
          <AntApp>
            <BrowserRouter>
              <NavigationProvider>
                <AppRouter />
              </NavigationProvider>
            </BrowserRouter>
          </AntApp>
      </ConfigProvider>
          </ThemeProvider>
        </TenantProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
