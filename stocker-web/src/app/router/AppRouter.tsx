import React, { useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { useTenant } from '@/contexts/TenantContext';
import MasterLayout from '@/features/master/layouts/MasterLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PageLoader } from '@/shared/components/PageLoader';

import { PrivateRoute } from './PrivateRoute';
import { SubdomainRoutes } from './SubdomainRoutes';

const ModernLanding = lazy(() => import('@/features/landing/pages/ModernLanding').then(m => ({ default: m.ModernLanding })));
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));
const RegisterPage = lazy(() => import('@/features/register/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const RegisterWizard = lazy(() => import('@/features/register/pages/RegisterWizard'));
const NotFoundPage = lazy(() => import('@/features/error/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const TrainingPage = lazy(() => import('@/features/training/pages/TrainingPage').then(m => ({ default: m.TrainingPage })));
const BlogPage = lazy(() => import('@/features/blog/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const PricingPage = lazy(() => import('@/features/pricing/pages/PricingPage').then(m => ({ default: m.PricingPage })));
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup'));
const CompanyWizard = lazy(() => import('@/features/company/pages/CompanyWizard'));
const TestSweetAlert = lazy(() => import('@/features/test/TestSweetAlert'));
const SignalRTestPage = lazy(() => import('@/features/register/pages/SignalRTest').then(m => ({ default: m.SignalRTestPage })));
const PaymentPage = lazy(() => import('@/features/payment/pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const FeatureTestPage = lazy(() => import('@/features/test/pages/FeatureTestPage'));
const RegisterWizardTest = lazy(() => import('@/features/test/pages/RegisterWizardTest').then(m => ({ default: m.RegisterWizardTest })));
const WelcomePage = lazy(() => import('@/features/welcome/pages/WelcomePage'));
const ModuleSelection = lazy(() => import('@/features/modules/pages/ModuleSelection').then(m => ({ default: m.ModuleSelection })));

// Master pages
// Dashboard removed - using module selection only
const MasterTenantsPage = lazy(() => import('@/features/master/pages/Tenants').then(m => ({ default: m.MasterTenantsPage })));
const MasterPackagesPage = lazy(() => import('@/features/master/pages/Packages').then(m => ({ default: m.MasterPackagesPage })));
const MasterSettingsPage = lazy(() => import('@/features/master/pages/Settings').then(m => ({ default: m.MasterSettingsPage })));
const EnhancedTenantDetail = lazy(() => import('@/features/master/pages/TenantDetail/EnhancedTenantDetail'));
const EnhancedSystemSettings = lazy(() => import('@/features/master/pages/Settings/EnhancedSystemSettings'));
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
const MasterBackupPage = lazy(() => import('@/features/master/pages/Backup').then(m => ({ default: m.ProfessionalBackup })));
const MasterEmailTemplatesPage = lazy(() => import('@/features/master/pages/EmailTemplates').then(m => ({ default: m.ProfessionalEmailTemplates })));
const PWADemo = lazy(() => import('@/pages/PWADemo').then(m => ({ default: m.default })));
const I18nDemo = lazy(() => import('@/pages/I18nDemo').then(m => ({ default: m.default })));

// Admin pages
// Dashboard removed - using module selection only
const TenantsPage = lazy(() => import('@/features/tenants/pages/TenantsPage').then(m => ({ default: m.TenantsPage })));
const PackagesPage = lazy(() => import('@/features/packages/pages/PackagesPage').then(m => ({ default: m.PackagesPage })));
const SubscriptionsPage = lazy(() => Promise.resolve({ default: () => <div>Subscriptions</div> }));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage').then(m => ({ default: m.UsersPage })));

// Tenant pages
// Dashboard removed - using module selection only
const InvoiceList = lazy(() => import('@/features/invoices/pages/InvoiceList'));
const CreateInvoice = lazy(() => import('@/features/invoices/pages/CreateInvoice'));
const InvoiceDetail = lazy(() => import('@/features/invoices/pages/InvoiceDetail').then(m => ({ default: m.InvoiceDetail })));
const InvoiceEdit = lazy(() => import('@/features/invoices/pages/InvoiceEdit').then(m => ({ default: m.InvoiceEdit })));
const TenantUsers = lazy(() => import('@/features/users/pages/TenantUsers').then(m => ({ default: m.TenantUsers })));
const TenantSettings = lazy(() => import('@/features/settings/pages/TenantSettings').then(m => ({ default: m.TenantSettings })));
const TenantSettingsNew = lazy(() => import('@/features/tenant/pages/SystemSettingsPage'));
const TenantModules = lazy(() => import('@/features/tenant/modules/pages/ModulesPage'));

// Module pages
const CRMRoutes = lazy(() => import('@/features/crm').then(m => ({ default: m.CRMRoutes })));
const CRMModule = lazy(() => import('@/features/modules/pages/CRMModule').then(m => ({ default: m.CRMModule })));
const InventoryModule = lazy(() => import('@/features/modules/pages/InventoryModule').then(m => ({ default: m.InventoryModule })));
const SalesModule = lazy(() => import('@/features/modules/pages/SalesModule').then(m => ({ default: m.SalesModule })));
const FinanceModule = lazy(() => import('@/features/modules/pages/FinanceModule').then(m => ({ default: m.FinanceModule })));
const HRModule = lazy(() => import('@/features/modules/pages/HRModule').then(m => ({ default: m.HRModule })));
const ProductionModule = lazy(() => import('@/features/modules/pages/ProductionModule').then(m => ({ default: m.ProductionModule })));

export const AppRouter: React.FC = () => {
  const { isSubdomain, tenantSlug, isValidTenant } = useTenant();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {}
  }, [isSubdomain, tenantSlug, isValidTenant]);

  // If we're on a subdomain and validation is still checking
  if (isSubdomain && isValidTenant === null) {
    return <PageLoader />;
  }

  // If we're on a subdomain but tenant is invalid
  if (isSubdomain && isValidTenant === false) {
    const InvalidTenantPage = lazy(() => import('@/features/error/pages/InvalidTenantPage'));
    return (
      <Suspense fallback={<PageLoader />}>
        <InvalidTenantPage tenantSlug={tenantSlug || undefined} />
      </Suspense>
    );
  }

  // If we're on a valid subdomain, use subdomain-specific routes
  if (isSubdomain && isValidTenant === true) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SubdomainRoutes />
      </Suspense>
    );
  }

  // Otherwise, use the standard routing structure
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page - No layout wrapper */}
        <Route path="/" element={<ModernLanding />} />
        <Route path="/old-landing" element={<LandingPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Register Page - No layout wrapper for full experience */}
        <Route path="/register-old" element={<RegisterWizard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/signalr-test" element={<SignalRTestPage />} />
        <Route path="/test-sweetalert" element={<TestSweetAlert />} />
        <Route path="/test-features" element={<FeatureTestPage />} />
        <Route path="/test-wizard" element={<RegisterWizardTest />} />
        
        {/* Company Setup - Protected route but no layout */}
        <Route 
          path="/company-setup" 
          element={
            <PrivateRoute>
              <CompanySetup />
            </PrivateRoute>
          } 
        />
        
        {/* Company Wizard - New comprehensive setup */}
        <Route 
          path="/company-wizard" 
          element={
            <PrivateRoute>
              <CompanyWizard />
            </PrivateRoute>
          } 
        />
        
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<TenantLogin />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
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
          <Route index element={<MasterTenantsPage />} />
          <Route path="tenants" element={<MasterTenantsPage />} />
          <Route path="tenants/:id" element={<EnhancedTenantDetail />} />
          <Route path="subscriptions/*" element={<MasterSubscriptionsPage />} />
          <Route path="packages" element={<MasterPackagesPage />} />
          <Route path="modules" element={<MasterModulesPage />} />
          <Route path="users" element={<MasterUsersPage />} />
          <Route path="monitoring/*" element={<MasterMonitoringPage />} />
          <Route path="reports/*" element={<MasterReportsPage />} />
          <Route path="settings" element={<EnhancedSystemSettings />} />
          <Route path="settings/*" element={<EnhancedSystemSettings />} />
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
          <Route path="backup" element={<MasterBackupPage />} />
          <Route path="email-templates" element={<MasterEmailTemplatesPage />} />
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
          <Route index element={<ModuleSelection />} />
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
          <Route path="modules" element={<TenantModules />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};