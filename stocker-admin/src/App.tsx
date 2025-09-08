import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import MasterLayout from './layouts/MasterLayout';
import Dashboard from './pages/Dashboard';
import TenantsPage from './pages/Tenants';
import TenantCreate from './pages/Tenants/Create';
import TenantDetails from './pages/Tenants/Details';
import TenantSettings from './pages/Tenants/Settings';
import TenantBilling from './pages/Tenants/Billing';
import TenantActivityLogs from './pages/Tenants/ActivityLogs';
import TenantApiKeys from './pages/Tenants/ApiKeys';
import TenantBackupRestore from './pages/Tenants/BackupRestore';
import TenantUsers from './pages/Tenants/Users';
import TenantDomains from './pages/Tenants/Domains';
import TenantMigrations from './pages/Tenants/Migrations';
import TenantSecurity from './pages/Tenants/Security';
import TenantAnalytics from './pages/Tenants/Analytics';
import TenantIntegrations from './pages/Tenants/Integrations';
import TenantWebhooks from './pages/Tenants/Webhooks';
import TenantHealth from './pages/Tenants/Health';
import UsersPage from './pages/Users';
import PackagesPage from './pages/Packages';
import { useAuthStore } from './stores/authStore';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MasterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/create" element={<TenantCreate />} />
          <Route path="tenants/:id" element={<TenantDetails />} />
          <Route path="tenants/:id/settings" element={<TenantSettings />} />
          <Route path="tenants/:id/billing" element={<TenantBilling />} />
          <Route path="tenants/:id/activity-logs" element={<TenantActivityLogs />} />
          <Route path="tenants/:id/api-keys" element={<TenantApiKeys />} />
          <Route path="tenants/:id/backup-restore" element={<TenantBackupRestore />} />
          <Route path="tenants/:id/users" element={<TenantUsers />} />
          <Route path="tenants/:id/domains" element={<TenantDomains />} />
          <Route path="tenants/:id/migrations" element={<TenantMigrations />} />
          <Route path="tenants/:id/security" element={<TenantSecurity />} />
          <Route path="tenants/:id/analytics" element={<TenantAnalytics />} />
          <Route path="tenants/:id/integrations" element={<TenantIntegrations />} />
          <Route path="tenants/:id/webhooks" element={<TenantWebhooks />} />
          <Route path="tenants/:id/health" element={<TenantHealth />} />
          <Route path="users/*" element={<UsersPage />} />
          <Route path="packages" element={<PackagesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;