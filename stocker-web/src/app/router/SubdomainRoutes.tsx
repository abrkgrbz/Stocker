import React from 'react';
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { PrivateRoute } from '@/app/router/PrivateRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';

const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ModuleSelection = lazy(() => import('@/features/modules/pages/ModuleSelection').then(m => ({ default: m.ModuleSelection })));
const WelcomePage = lazy(() => import('@/features/welcome/pages/WelcomePage'));
const InvoiceList = lazy(() => import('@/features/invoices/pages/InvoiceList'));
const CreateInvoice = lazy(() => import('@/features/invoices/pages/CreateInvoice'));
const InvoiceDetail = lazy(() => import('@/features/invoices/pages/InvoiceDetail').then(m => ({ default: m.InvoiceDetail })));
const InvoiceEdit = lazy(() => import('@/features/invoices/pages/InvoiceEdit').then(m => ({ default: m.InvoiceEdit })));
const TenantUsers = lazy(() => import('@/features/users/pages/TenantUsers').then(m => ({ default: m.TenantUsers })));
const TenantSettings = lazy(() => import('@/features/settings/pages/TenantSettings').then(m => ({ default: m.TenantSettings })));
const TenantSettingsNew = lazy(() => import('@/features/tenant/pages/SystemSettingsPage'));
const TenantModules = lazy(() => import('@/features/tenant/modules/pages/ModulesPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));

// Module pages
const CRMRoutes = lazy(() => import('@/features/crm').then(m => ({ default: m.CRMRoutes })));
const InventoryModule = lazy(() => import('@/features/modules/pages/InventoryModule').then(m => ({ default: m.InventoryModule })));
const SalesModule = lazy(() => import('@/features/modules/pages/SalesModule').then(m => ({ default: m.SalesModule })));
const FinanceModule = lazy(() => import('@/features/modules/pages/FinanceModule').then(m => ({ default: m.FinanceModule })));
const HRModule = lazy(() => import('@/features/modules/pages/HRModule').then(m => ({ default: m.HRModule })));
const ProductionModule = lazy(() => import('@/features/modules/pages/ProductionModule').then(m => ({ default: m.ProductionModule })));

/**
 * Routes for subdomain access (e.g., tenant.stoocker.app)
 * These routes are at root level without /app/:tenantId prefix
 */
export const SubdomainRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicLayout />}>
        <Route index element={<TenantLogin />} />
      </Route>
      <Route path="/forgot-password" element={<PublicLayout />}>
        <Route index element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/verify-email" element={<PublicLayout />}>
        <Route index element={<EmailVerificationPage />} />
      </Route>

      {/* Protected Tenant Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <TenantLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ModuleSelection />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
        <Route path="crm/*" element={<CRMRoutes />} />
        <Route path="inventory/*" element={<InventoryModule />} />
        <Route path="sales/*" element={<SalesModule />} />
        <Route path="finance/*" element={<FinanceModule />} />
        <Route path="hr/*" element={<HRModule />} />
        <Route path="production/*" element={<ProductionModule />} />
        <Route path="users" element={<TenantUsers />} />
        <Route path="settings-old" element={<TenantSettings />} />
        <Route path="settings" element={<TenantSettingsNew />} />
      </Route>
    </Routes>
  );
};