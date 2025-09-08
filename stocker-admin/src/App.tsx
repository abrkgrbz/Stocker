import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import MasterLayout from './layouts/MasterLayout';
import Dashboard from './pages/Dashboard';
import TenantsPage from './pages/Tenants';
import TenantCreate from './pages/Tenants/Create';
import TenantDomains from './pages/Tenants/Domains';
import TenantMigrations from './pages/Tenants/Migrations';
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
          <Route path="tenants/list" element={<TenantsPage />} />
          <Route path="tenants/domains" element={<TenantDomains />} />
          <Route path="tenants/migrations" element={<TenantMigrations />} />
          <Route path="users/*" element={<UsersPage />} />
          <Route path="packages" element={<PackagesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;