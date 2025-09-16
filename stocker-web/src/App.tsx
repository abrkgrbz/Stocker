import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

// Contexts
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TenantProvider, useTenant } from '@/contexts/TenantContext';

// Stores
import { useAuthStore } from '@/app/store/auth.store';

// Styles
import '@/styles/dark-mode.css';
import '@/features/master/styles/dark-mode-mui.css';

// Monitoring & Analytics
import { initSentry, setUser, trackPageView } from '@/services/monitoring';
import { analytics } from '@/services/analytics';
import { initWebVitals } from '@/services/web-vitals';

// i18n
import '@/i18n/config';

// Components
import { AppRouter } from '@/app/router/AppRouter';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { PageLoader } from '@/shared/components/PageLoader';
import InvalidTenantPage from '@/features/error/pages/InvalidTenantPage';

// Styles
import './App.css';

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
    console.log('[App] Initializing auth state...');
    
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
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log('[App] Auth state changed:', {
      isInitialized,
      isLoading,
      isAuthenticated,
      userRoles: user?.roles
    });
  }, [isInitialized, isLoading, isAuthenticated, user]);

  // Show loading spinner while checking initial auth state
  if (!isInitialized || isLoading) {
    console.log('[App] Still initializing auth...', { isInitialized, isLoading });
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
        <ProConfigProvider>
          <AntApp>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AntApp>
        </ProConfigProvider>
      </ConfigProvider>
          </ThemeProvider>
        </TenantProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
