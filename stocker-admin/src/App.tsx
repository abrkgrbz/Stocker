import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from './stores/authStore';
import { SentryErrorBoundary } from './components/ErrorBoundary/SentryErrorBoundary';
import * as Sentry from '@sentry/react';

// Immediate imports (needed right away)
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import MasterLayout from './layouts/MasterLayout';

// Lazy loaded pages (loaded on demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TenantsPage = lazy(() => import('./pages/Tenants'));
const TenantCreate = lazy(() => import('./pages/Tenants/Create'));
const TenantDetails = lazy(() => import('./pages/Tenants/Details'));
const TenantSettings = lazy(() => import('./pages/Tenants/Settings'));
const TenantBilling = lazy(() => import('./pages/Tenants/Billing'));
const TenantActivityLogs = lazy(() => import('./pages/Tenants/ActivityLogs'));
const TenantApiKeys = lazy(() => import('./pages/Tenants/ApiKeys'));
const TenantBackupRestore = lazy(() => import('./pages/Tenants/BackupRestore'));
const TenantUsers = lazy(() => import('./pages/Tenants/Users'));
const TenantDomains = lazy(() => import('./pages/Tenants/Domains'));
const TenantMigrations = lazy(() => import('./pages/Tenants/Migrations'));
const TenantSecurity = lazy(() => import('./pages/Tenants/Security'));
const TenantAnalytics = lazy(() => import('./pages/Tenants/Analytics'));
const TenantIntegrations = lazy(() => import('./pages/Tenants/Integrations'));
const TenantWebhooks = lazy(() => import('./pages/Tenants/Webhooks'));
const TenantHealth = lazy(() => import('./pages/Tenants/Health'));
const TenantNotifications = lazy(() => import('./pages/Tenants/Notifications'));
const TenantCompliance = lazy(() => import('./pages/Tenants/Compliance'));
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
    <SentryErrorBoundary>
      <BrowserRouter>
        <SentryRoutes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MasterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
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
          <Route path="tenants/create" element={
            <Suspense fallback={<PageLoader />}>
              <TenantCreate />
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
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </SentryRoutes>
      </BrowserRouter>
    </SentryErrorBoundary>
  );
}

export default App;