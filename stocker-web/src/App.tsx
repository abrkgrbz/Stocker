import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as AntApp } from 'antd';
import { ProConfigProvider } from '@ant-design/pro-components';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

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
import { MasterDashboard } from '@/features/dashboard/pages/MasterDashboard';
import { AdminDashboard } from '@/features/dashboard/pages/AdminDashboard';
import { TenantDashboard } from '@/features/dashboard/pages/TenantDashboard';
import { TenantsPage } from '@/features/tenants/pages/TenantsPage';
import { MasterTenantsPage } from '@/features/master/pages/Tenants';
import { MasterPackagesPage } from '@/features/master/pages/Packages';
import { SubscriptionsPage } from '@/features/subscriptions/pages/SubscriptionsPage';
import { PackagesPage } from '@/features/packages/pages/PackagesPage';
import { UsersPage } from '@/features/users/pages/UsersPage';

// Components
import { PrivateRoute } from '@/app/router/PrivateRoute';

// Styles
import './App.css';

dayjs.locale('en');

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
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={enUS}
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
                
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<div>Register Page</div>} />
                  <Route path="/forgot-password" element={<div>Forgot Password</div>} />
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
                  <Route path="crm/*" element={<div>CRM Module</div>} />
                  <Route path="inventory/*" element={<div>Inventory Module</div>} />
                  <Route path="users" element={<div>Tenant Users</div>} />
                  <Route path="settings" element={<div>Tenant Settings</div>} />
                </Route>

                {/* 404 Page */}
                <Route path="*" element={<div>404 - Page Not Found</div>} />
              </Routes>
            </BrowserRouter>
          </AntApp>
        </ProConfigProvider>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App
