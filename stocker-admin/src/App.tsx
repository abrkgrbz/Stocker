import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, Spin } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { SentryErrorBoundary } from './components/ErrorBoundary/SentryErrorBoundary';
import * as Sentry from '@sentry/react';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Immediate imports (needed right away)
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import MasterLayout from './layouts/MasterLayout';
import CMSLayout from './layouts/CMSLayout';
import TwoFactorVerifyPage from './pages/TwoFactorVerifyPage';
import AdminHome from './pages/AdminHome';

// Lazy loaded pages (loaded on demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TenantsPage = lazy(() => import('./pages/Tenants'));
const TenantDetails = lazy(() => import('./pages/Tenants/Details'));
const TenantSettings = lazy(() => import('./pages/Tenants/Settings'));
const TenantBilling = lazy(() => import('./pages/Tenants/Billing'));
const TenantActivityLogs = lazy(() => import('./pages/Tenants/ActivityLogs'));
const TenantApiKeys = lazy(() => import('./pages/Tenants/ApiKeys'));
const TenantBackupRestore = lazy(() => import('./pages/Tenants/BackupRestore'));
const TenantUsers = lazy(() => import('./pages/Tenants/Users'));
const TenantDomains = lazy(() => import('./pages/Tenants/Domains'));
const TenantMigrations = lazy(() => import('./pages/Tenants/Migrations/index'));
const TenantModules = lazy(() => import('./pages/Tenants/Modules'));
const TenantSecurity = lazy(() => import('./pages/Tenants/Security'));
const TenantAnalytics = lazy(() => import('./pages/Tenants/Analytics'));
const TenantIntegrations = lazy(() => import('./pages/Tenants/Integrations'));
const TenantWebhooks = lazy(() => import('./pages/Tenants/Webhooks'));
const TenantHealth = lazy(() => import('./pages/Tenants/Health'));
const TenantNotifications = lazy(() => import('./pages/Tenants/Notifications'));
const TenantCompliance = lazy(() => import('./pages/Tenants/Compliance'));
const TenantRegistrationsPage = lazy(() => import('./pages/TenantRegistrations'));
const UsersPage = lazy(() => import('./pages/Users'));
const UserRolesPage = lazy(() => import('./pages/Users/Roles'));
const UserPermissionsPage = lazy(() => import('./pages/Users/Permissions'));
const FeaturesPage = lazy(() => import('./pages/Features'));
const ModulesPage = lazy(() => import('./pages/Modules'));
const PackagesPage = lazy(() => import('./pages/Packages'));
const SubscriptionsPage = lazy(() => import('./pages/Subscriptions'));
const InvoicesPage = lazy(() => import('./pages/Invoices'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const MonitoringPage = lazy(() => import('./pages/Monitoring'));
const SupportPage = lazy(() => import('./pages/Support'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogs'));
const ApiStatusPage = lazy(() => import('./pages/ApiStatus'));
const HangfireDashboard = lazy(() => import('./pages/Hangfire/HangfireDashboard'));
const StoragePage = lazy(() => import('./pages/Storage'));
const SecretsPage = lazy(() => import('./pages/Secrets'));
const EmailTemplatesPage = lazy(() => import('./pages/EmailTemplates'));

// CMS Pages
const CMSDashboard = lazy(() => import('./pages/CMS/Dashboard'));
const CMSPages = lazy(() => import('./pages/CMS/Pages'));
const CMSBlog = lazy(() => import('./pages/CMS/Blog'));
const CMSFAQ = lazy(() => import('./pages/CMS/FAQ'));
const CMSLanding = lazy(() => import('./pages/CMS/Landing'));
const CMSCompany = lazy(() => import('./pages/CMS/Company'));
const CMSDocs = lazy(() => import('./pages/CMS/Docs'));

// Loading component
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0a0e27'
  }}>
    <Spin size="large" tip="Yükleniyor..." />
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Sentry-enhanced Browser Router
const SentryRoutes = Sentry.withSentryRouting(Routes);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  // Check and restore auth state on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <SentryErrorBoundary>
        <AntdApp>
          <BrowserRouter>
            <SentryRoutes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />

        {/* Admin Home - Panel Selection */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />

        {/* CMS Layout and Routes */}
        <Route
          path="/cms"
          element={
            <ProtectedRoute>
              <CMSLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/cms/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <CMSDashboard />
            </Suspense>
          } />
          <Route path="pages" element={
            <Suspense fallback={<PageLoader />}>
              <CMSPages />
            </Suspense>
          } />
          <Route path="pages/*" element={
            <Suspense fallback={<PageLoader />}>
              <CMSPages />
            </Suspense>
          } />
          <Route path="blog" element={
            <Suspense fallback={<PageLoader />}>
              <CMSBlog />
            </Suspense>
          } />
          <Route path="blog/*" element={
            <Suspense fallback={<PageLoader />}>
              <CMSBlog />
            </Suspense>
          } />
          <Route path="faq" element={
            <Suspense fallback={<PageLoader />}>
              <CMSFAQ />
            </Suspense>
          } />
          <Route path="landing" element={
            <Suspense fallback={<PageLoader />}>
              <CMSLanding />
            </Suspense>
          } />
          <Route path="company" element={
            <Suspense fallback={<PageLoader />}>
              <CMSCompany />
            </Suspense>
          } />
          <Route path="docs" element={
            <Suspense fallback={<PageLoader />}>
              <CMSDocs />
            </Suspense>
          } />
        </Route>

        {/* Tenant Admin Layout and Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MasterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin-home" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          } />
          <Route path="tenants" element={
            <Suspense fallback={<PageLoader />}>
              <TenantsPage />
            </Suspense>
          } />
          <Route path="tenant-registrations" element={
            <Suspense fallback={<PageLoader />}>
              <TenantRegistrationsPage />
            </Suspense>
          } />
          <Route path="tenants/migrations" element={
            <Suspense fallback={<PageLoader />}>
              <TenantMigrations />
            </Suspense>
          } />
          <Route path="tenants/modules" element={
            <Suspense fallback={<PageLoader />}>
              <TenantModules />
            </Suspense>
          } />
          <Route path="tenants/:id" element={
            <Suspense fallback={<PageLoader />}>
              <TenantDetails />
            </Suspense>
          } />
          <Route path="tenants/:id/settings" element={
            <Suspense fallback={<PageLoader />}>
              <TenantSettings />
            </Suspense>
          } />
          <Route path="tenants/:id/billing" element={
            <Suspense fallback={<PageLoader />}>
              <TenantBilling />
            </Suspense>
          } />
          <Route path="tenants/:id/activity-logs" element={
            <Suspense fallback={<PageLoader />}>
              <TenantActivityLogs />
            </Suspense>
          } />
          <Route path="tenants/:id/api-keys" element={
            <Suspense fallback={<PageLoader />}>
              <TenantApiKeys />
            </Suspense>
          } />
          <Route path="tenants/:id/backup-restore" element={
            <Suspense fallback={<PageLoader />}>
              <TenantBackupRestore />
            </Suspense>
          } />
          <Route path="tenants/:id/users" element={
            <Suspense fallback={<PageLoader />}>
              <TenantUsers />
            </Suspense>
          } />
          <Route path="tenants/:id/domains" element={
            <Suspense fallback={<PageLoader />}>
              <TenantDomains />
            </Suspense>
          } />
          <Route path="tenants/:id/migrations" element={
            <Suspense fallback={<PageLoader />}>
              <TenantMigrations />
            </Suspense>
          } />
          <Route path="tenants/:id/security" element={
            <Suspense fallback={<PageLoader />}>
              <TenantSecurity />
            </Suspense>
          } />
          <Route path="tenants/:id/analytics" element={
            <Suspense fallback={<PageLoader />}>
              <TenantAnalytics />
            </Suspense>
          } />
          <Route path="tenants/:id/integrations" element={
            <Suspense fallback={<PageLoader />}>
              <TenantIntegrations />
            </Suspense>
          } />
          <Route path="tenants/:id/webhooks" element={
            <Suspense fallback={<PageLoader />}>
              <TenantWebhooks />
            </Suspense>
          } />
          <Route path="tenants/:id/health" element={
            <Suspense fallback={<PageLoader />}>
              <TenantHealth />
            </Suspense>
          } />
          <Route path="tenants/:id/notifications" element={
            <Suspense fallback={<PageLoader />}>
              <TenantNotifications />
            </Suspense>
          } />
          <Route path="tenants/:id/compliance" element={
            <Suspense fallback={<PageLoader />}>
              <TenantCompliance />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          } />
          <Route path="users/roles" element={
            <Suspense fallback={<PageLoader />}>
              <UserRolesPage />
            </Suspense>
          } />
          <Route path="users/permissions" element={
            <Suspense fallback={<PageLoader />}>
              <UserPermissionsPage />
            </Suspense>
          } />
          <Route path="packages" element={
            <Suspense fallback={<PageLoader />}>
              <PackagesPage />
            </Suspense>
          } />
          <Route path="features" element={
            <Suspense fallback={<PageLoader />}>
              <FeaturesPage />
            </Suspense>
          } />
          <Route path="modules" element={
            <Suspense fallback={<PageLoader />}>
              <ModulesPage />
            </Suspense>
          } />
          <Route path="hangfire" element={
            <Suspense fallback={<PageLoader />}>
              <HangfireDashboard />
            </Suspense>
          } />
          <Route path="subscriptions" element={
            <Suspense fallback={<PageLoader />}>
              <SubscriptionsPage />
            </Suspense>
          } />
          <Route path="invoices" element={
            <Suspense fallback={<PageLoader />}>
              <InvoicesPage />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          } />
          <Route path="monitoring" element={
            <Suspense fallback={<PageLoader />}>
              <MonitoringPage />
            </Suspense>
          } />
          <Route path="support" element={
            <Suspense fallback={<PageLoader />}>
              <SupportPage />
            </Suspense>
          } />
          <Route path="audit-logs" element={
            <Suspense fallback={<PageLoader />}>
              <AuditLogsPage />
            </Suspense>
          } />
          <Route path="api-status" element={
            <Suspense fallback={<PageLoader />}>
              <ApiStatusPage />
            </Suspense>
          } />
          <Route path="storage" element={
            <Suspense fallback={<PageLoader />}>
              <StoragePage />
            </Suspense>
          } />
          <Route path="secrets" element={
            <Suspense fallback={<PageLoader />}>
              <SecretsPage />
            </Suspense>
          } />
          <Route path="email-templates" element={
            <Suspense fallback={<PageLoader />}>
              <EmailTemplatesPage />
            </Suspense>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/admin-home" replace />} />
            </SentryRoutes>
          </BrowserRouter>
        </AntdApp>
      </SentryErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;