import React, { useEffect, useState } from 'react';
import { lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PrivateRoute } from './PrivateRoute';
import { useAuthStore } from '@/app/store/auth.store';

const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup'));
const CompanyWizard = lazy(() => import('@/features/company/pages/CompanyWizard'));
const ModulesScreen = lazy(() => import('@/features/modules/pages/ModulesScreen'));

/**
 * Routes for subdomain access (e.g., tenant.stoocker.app)
 * Handles both public auth routes and private tenant routes
 */
export const SubdomainRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isCompanySetupComplete, setIsCompanySetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if company setup is complete
    // This could be from user data or a separate API call
    if (user || isAuthenticated) {
      // Check if user has company data
      // For now, we'll assume if they don't have a companyId, they need to set up
      const hasCompany = user?.companyId || user?.company || localStorage.getItem('company_setup_complete');
      setIsCompanySetupComplete(!!hasCompany);
    } else {
      // If not authenticated, default to false
      setIsCompanySetupComplete(false);
    }
  }, [user, isAuthenticated]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={isAuthenticated ? <Navigate to="/app" replace /> : <TenantLogin />} />
        <Route path="login" element={<TenantLogin />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verify-email" element={<EmailVerificationPage />} />
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<TenantLayout />}>
          {/* Company Setup - Required for first-time users */}
          <Route path="company-setup" element={<CompanySetup />} />
          <Route path="company-wizard" element={<CompanyWizard />} />
          
          {/* Main Application Route - Check for company setup */}
          <Route 
            path="app" 
            element={
              isCompanySetupComplete === null 
                ? <div>Yükleniyor...</div> 
                : isCompanySetupComplete === false 
                ? <Navigate to="/company-setup" replace /> 
                : <ModulesScreen />
            } 
          />
          
          {/* Future module routes will go here */}
          {/* <Route path="crm/*" element={<CRMModule />} /> */}
          {/* <Route path="inventory/*" element={<InventoryModule />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Route>

      {/* Catch all - redirect to app or login */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />} />
    </Routes>
  );
};