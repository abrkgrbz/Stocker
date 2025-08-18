import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

// Stores
import { useAuthStore } from '@/app/store/auth.store';

// Layouts
import { MasterLayout } from '@/layouts/MasterLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Pages
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { RegisterPage } from '@/features/register/pages/RegisterPage';
import { SignalRTestPage } from '@/features/register/pages/SignalRTest';
import { PaymentPage } from '@/features/payment/pages/PaymentPage';
import { MasterDashboard } from '@/features/dashboard/pages/MasterDashboard';
import { AdminDashboard } from '@/features/dashboard/pages/AdminDashboard';
import { TenantDashboard } from '@/features/dashboard/pages/TenantDashboard';
import { TenantsPage } from '@/features/tenants/pages/TenantsPage';
import { MasterTenantsPage } from '@/features/master/pages/Tenants';
import { MasterPackagesPage } from '@/features/master/pages/Packages';
// import { SubscriptionsPage } from '@/features/subscriptions/pages/SubscriptionsPage';
import { PackagesPage } from '@/features/packages/pages/PackagesPage';
const SubscriptionsPage = () => <div>Subscriptions</div>;
import { UsersPage } from '@/features/users/pages/UsersPage';
import InvoiceList from '@/features/invoices/pages/InvoiceList';
import CreateInvoice from '@/features/invoices/pages/CreateInvoice';
import { InvoiceDetail } from '@/features/invoices/pages/InvoiceDetail';
import { InvoiceEdit } from '@/features/invoices/pages/InvoiceEdit';
import { TenantUsers } from '@/features/users/pages/TenantUsers';
import { TenantSettings } from '@/features/settings/pages/TenantSettings';
import { NotFoundPage } from '@/features/error/pages/NotFoundPage';

// Module Pages
import { CRMModule } from '@/features/modules/pages/CRMModule';
import { InventoryModule } from '@/features/modules/pages/InventoryModule';
import { SalesModule } from '@/features/modules/pages/SalesModule';
import { FinanceModule } from '@/features/modules/pages/FinanceModule';
import { HRModule } from '@/features/modules/pages/HRModule';
import { ProductionModule } from '@/features/modules/pages/ProductionModule';

// Components
import { PrivateRoute } from '@/app/router/PrivateRoute';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Styles
import './App.css';

dayjs.locale('tr');

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
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    console.log('App mounting, initializing auth...');
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while checking initial auth state
  if (!isInitialized || isLoading) {
    console.log('App loading state:', { isInitialized, isLoading });
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
            <Spin size="large" tip="Yükleniyor..." />
          </AntApp>
        </ConfigProvider>
      </div>
    );
  }

  console.log('App initialized, rendering routes...');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
              <Routes>
                {/* Landing Page - No layout wrapper */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Register Page - No layout wrapper for full experience */}
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/signalr-test" element={<SignalRTestPage />} />
                
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Master Routes - Only for System Admin */}
                <Route
                  path="/master"
                  element={
                    <PrivateRoute roles={['SystemAdmin']}>
                      <MasterLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<MasterDashboard />} />
                  <Route path="tenants/*" element={<MasterTenantsPage />} />
                  <Route path="subscriptions/*" element={<SubscriptionsPage />} />
                  <Route path="packages" element={<MasterPackagesPage />} />
                  <Route path="modules" element={<div>Modules Management</div>} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="monitoring/*" element={<div>System Monitoring</div>} />
                  <Route path="reports/*" element={<div>Reports</div>} />
                  <Route path="settings/*" element={<div>System Settings</div>} />
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
            </BrowserRouter>
          </AntApp>
        </ProConfigProvider>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
