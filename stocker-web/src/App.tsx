import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

// Contexts
import { ThemeProvider } from '@/contexts/ThemeContext';

// Stores
import { useAuthStore } from '@/app/store/auth.store';

// Styles
import '@/styles/dark-mode.css';

// Monitoring & Analytics
import { initSentry, setUser, trackPageView } from '@/services/monitoring';
import { analytics } from '@/services/analytics';
import { initWebVitals } from '@/services/web-vitals';

// i18n
import '@/i18n/config';

// Layouts
import MetronicLayout from '@/layouts/MetronicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Lazy load pages for better performance
const ModernLanding = lazy(() => import('@/features/landing/pages/ModernLanding').then(m => ({ default: m.ModernLanding })));
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));
const RegisterPage = lazy(() => import('@/features/register/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const RegisterWizard = lazy(() => import('@/features/register/pages/RegisterWizard'));
const SignalRTestPage = lazy(() => import('@/features/register/pages/SignalRTest').then(m => ({ default: m.SignalRTestPage })));
const PaymentPage = lazy(() => import('@/features/payment/pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const MasterDashboard = lazy(() => import('@/features/master/pages/Dashboard').then(m => ({ default: m.MasterDashboard })));
const AdminDashboard = lazy(() => import('@/features/dashboard/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TenantDashboard = lazy(() => import('@/features/dashboard/pages/TenantDashboard').then(m => ({ default: m.TenantDashboard })));
const TenantsPage = lazy(() => import('@/features/tenants/pages/TenantsPage').then(m => ({ default: m.TenantsPage })));
const MasterTenantsPage = lazy(() => import('@/features/master/pages/Tenants').then(m => ({ default: m.MasterTenantsPage })));
const MasterPackagesPage = lazy(() => import('@/features/master/pages/Packages').then(m => ({ default: m.MasterPackagesPage })));
const MasterSettingsPage = lazy(() => import('@/features/master/pages/Settings').then(m => ({ default: m.MasterSettingsPage })));
const EnhancedTenantDetail = lazy(() => import('@/features/master/pages/TenantDetail/EnhancedTenantDetail'));
const MasterSubscriptionsPage = lazy(() => import('@/features/master/pages/Subscriptions').then(m => ({ default: m.MasterSubscriptionsPage })));
const MasterMigrationsPage = lazy(() => import('@/features/master/pages/Migrations').then(m => ({ default: m.default })));
const MasterUsersPage = lazy(() => import('@/features/master/pages/Users').then(m => ({ default: m.MasterUsersPage })));
const MasterModulesPage = lazy(() => import('@/features/master/pages/Modules').then(m => ({ default: m.MasterModulesPage })));
const MasterMonitoringPage = lazy(() => import('@/features/master/pages/Monitoring').then(m => ({ default: m.MasterMonitoringPage })));
const MasterReportsPage = lazy(() => import('@/features/master/pages/Reports').then(m => ({ default: m.MasterReportsPage })));
const MasterInvoicesPage = lazy(() => import('@/features/master/pages/Invoices').then(m => ({ default: m.default })));
const MasterPaymentsPage = lazy(() => import('@/features/master/pages/Payments').then(m => ({ default: m.default })));
const MasterAnalyticsPage = lazy(() => import('@/features/master/pages/Analytics').then(m => ({ default: m.default })));
const MasterPerformancePage = lazy(() => import('@/features/master/pages/Performance').then(m => ({ default: m.default })));
const MasterNotificationSettingsPage = lazy(() => import('@/features/master/pages/NotificationSettings').then(m => ({ default: m.default })));
const MasterApiManagementPage = lazy(() => import('@/features/master/pages/ApiManagement').then(m => ({ default: m.default })));
const MasterAuditLogsPage = lazy(() => import('@/features/master/pages/AuditLogs').then(m => ({ default: m.default })));
const MasterBillingPage = lazy(() => import('@/features/master/pages/Billing').then(m => ({ default: m.default })));
const MasterSystemMonitoringPage = lazy(() => import('@/features/master/pages/Monitoring/SystemMonitoring').then(m => ({ default: m.default })));
const PWADemo = lazy(() => import('@/pages/PWADemo').then(m => ({ default: m.default })));
const I18nDemo = lazy(() => import('@/pages/I18nDemo').then(m => ({ default: m.default })));
const PackagesPage = lazy(() => import('@/features/packages/pages/PackagesPage').then(m => ({ default: m.PackagesPage })));
const SubscriptionsPage = lazy(() => Promise.resolve({ default: () => <div>Subscriptions</div> }));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage').then(m => ({ default: m.UsersPage })));
const InvoiceList = lazy(() => import('@/features/invoices/pages/InvoiceList'));
const CreateInvoice = lazy(() => import('@/features/invoices/pages/CreateInvoice'));
const InvoiceDetail = lazy(() => import('@/features/invoices/pages/InvoiceDetail').then(m => ({ default: m.InvoiceDetail })));
const InvoiceEdit = lazy(() => import('@/features/invoices/pages/InvoiceEdit').then(m => ({ default: m.InvoiceEdit })));
const TenantUsers = lazy(() => import('@/features/users/pages/TenantUsers').then(m => ({ default: m.TenantUsers })));
const TenantSettings = lazy(() => import('@/features/settings/pages/TenantSettings').then(m => ({ default: m.TenantSettings })));
const WelcomePage = lazy(() => import('@/features/welcome/pages/WelcomePage'));
const NotFoundPage = lazy(() => import('@/features/error/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup'));
const TestSweetAlert = lazy(() => import('@/features/test/TestSweetAlert'));

// Lazy load module pages
const CRMModule = lazy(() => import('@/features/modules/pages/CRMModule').then(m => ({ default: m.CRMModule })));
const InventoryModule = lazy(() => import('@/features/modules/pages/InventoryModule').then(m => ({ default: m.InventoryModule })));
const SalesModule = lazy(() => import('@/features/modules/pages/SalesModule').then(m => ({ default: m.SalesModule })));
const FinanceModule = lazy(() => import('@/features/modules/pages/FinanceModule').then(m => ({ default: m.FinanceModule })));
const HRModule = lazy(() => import('@/features/modules/pages/HRModule').then(m => ({ default: m.HRModule })));
const ProductionModule = lazy(() => import('@/features/modules/pages/ProductionModule').then(m => ({ default: m.ProductionModule })));

// Components
import { PrivateRoute } from '@/app/router/PrivateRoute';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { PageLoader } from '@/shared/components/PageLoader';

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Landing Page - No layout wrapper */}
                <Route path="/" element={<ModernLanding />} />
                <Route path="/old-landing" element={<LandingPage />} />
                
                {/* Register Page - No layout wrapper for full experience */}
                <Route path="/register-old" element={<RegisterWizard />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/signalr-test" element={<SignalRTestPage />} />
                <Route path="/test-sweetalert" element={<TestSweetAlert />} />
                
                {/* Company Setup - Protected route but no layout */}
                <Route 
                  path="/company-setup" 
                  element={
                    <PrivateRoute>
                      <CompanySetup />
                    </PrivateRoute>
                  } 
                />
                
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-email" element={<EmailVerificationPage />} />
                </Route>

                {/* Master Routes - Only for System Admin */}
                <Route
                  path="/master"
                  element={
                    <PrivateRoute roles={['SystemAdmin']}>
                      <MetronicLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<MasterDashboard />} />
                  <Route path="tenants" element={<MasterTenantsPage />} />
                  <Route path="tenants/:id" element={<EnhancedTenantDetail />} />
                  <Route path="subscriptions/*" element={<MasterSubscriptionsPage />} />
                  <Route path="packages" element={<MasterPackagesPage />} />
                  <Route path="modules" element={<MasterModulesPage />} />
                  <Route path="users" element={<MasterUsersPage />} />
                  <Route path="monitoring/*" element={<MasterMonitoringPage />} />
                  <Route path="reports/*" element={<MasterReportsPage />} />
                  <Route path="settings/*" element={<MasterSettingsPage />} />
                  <Route path="migrations" element={<MasterMigrationsPage />} />
                  <Route path="invoices" element={<MasterInvoicesPage />} />
                  <Route path="payments" element={<MasterPaymentsPage />} />
                  <Route path="analytics" element={<MasterAnalyticsPage />} />
                  <Route path="performance" element={<MasterPerformancePage />} />
                  <Route path="notification-settings" element={<MasterNotificationSettingsPage />} />
                  <Route path="api-management" element={<MasterApiManagementPage />} />
                  <Route path="audit-logs" element={<MasterAuditLogsPage />} />
                  <Route path="billing" element={<MasterBillingPage />} />
                  <Route path="monitoring/system" element={<MasterSystemMonitoringPage />} />
                  <Route path="pwa-demo" element={<PWADemo />} />
                  <Route path="i18n-demo" element={<I18nDemo />} />
                </Route>

                {/* Admin Routes - For Tenant Admins */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute roles={['Admin', 'TenantAdmin']}>
                      <AdminLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="tenants" element={<TenantsPage />} />
                  <Route path="packages" element={<PackagesPage />} />
                  <Route path="subscriptions" element={<SubscriptionsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="reports" element={<div>Reports Page</div>} />
                  <Route path="settings" element={<div>Settings Page</div>} />
                </Route>

                {/* Tenant Routes */}
                <Route
                  path="/app/:tenantId"
                  element={
                    <PrivateRoute>
                      <TenantLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<TenantDashboard />} />
                  <Route path="welcome" element={<WelcomePage />} />
                  <Route path="dashboard" element={<TenantDashboard />} />
                  <Route path="invoices" element={<InvoiceList />} />
                  <Route path="invoices/new" element={<CreateInvoice />} />
                  <Route path="invoices/:id" element={<InvoiceDetail />} />
                  <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                  <Route path="crm/*" element={<CRMModule />} />
                  <Route path="inventory/*" element={<InventoryModule />} />
                  <Route path="sales/*" element={<SalesModule />} />
                  <Route path="finance/*" element={<FinanceModule />} />
                  <Route path="hr/*" element={<HRModule />} />
                  <Route path="production/*" element={<ProductionModule />} />
                  <Route path="users" element={<TenantUsers />} />
                  <Route path="settings" element={<TenantSettings />} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AntApp>
        </ProConfigProvider>
      </ConfigProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
