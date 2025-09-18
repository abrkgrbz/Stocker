import React, { useEffect, useState, Suspense } from 'react';
import { lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PrivateRoute } from './PrivateRoute';
import { useAuthStore } from '@/app/store/auth.store';
import companyService from '@/services/companyService';

const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup'));
const CompanyWizard = lazy(() => import('@/features/company/pages/CompanyWizard'));
const ModulesScreen = lazy(() => import('@/features/modules/pages/ModulesScreen').then(m => ({ default: m.ModulesScreen })));

/**
 * Routes for subdomain access (e.g., tenant.stoocker.app)
 * Handles both public auth routes and private tenant routes
 */
export const SubdomainRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isCompanySetupComplete, setIsCompanySetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if company setup is complete by fetching company data
    const checkCompanySetup = async () => {
      if (isAuthenticated) {
        try {
          const hasCompany = await companyService.checkCompanyExists();
          setIsCompanySetupComplete(hasCompany);
          
          // Store in localStorage for quick access
          if (hasCompany) {
            localStorage.setItem('company_setup_complete', 'true');
          } else {
            localStorage.removeItem('company_setup_complete');
          }
        } catch (error) {
          console.error('Error checking company setup:', error);
          // In case of error, check localStorage as fallback
          const localCompanySetup = localStorage.getItem('company_setup_complete');
          setIsCompanySetupComplete(localCompanySetup === 'true');
        }
      } else {
        // If not authenticated, set to false
        setIsCompanySetupComplete(false);
      }
    };

    checkCompanySetup();
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
                ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spin size="large" tip="Yükleniyor..." />
                  </div> 
                : isCompanySetupComplete === false 
                ? <Navigate to="/company-setup" replace /> 
                : <Suspense fallback={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                      <Spin size="large" tip="Modüller yükleniyor..." />
                    </div>
                  }>
                    <ModulesScreen />
                  </Suspense>
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