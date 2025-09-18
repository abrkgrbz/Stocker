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
    // Check if company setup is complete
    const checkCompanySetup = async () => {
      if (isAuthenticated) {
        try {
          // Check localStorage first for quick initial state
          const localCompanySetup = localStorage.getItem('company_setup_complete');
          if (localCompanySetup === 'true') {
            setIsCompanySetupComplete(true);
          }
          
          // Then verify with actual API
          console.log('Checking company setup status from API...');
          const hasCompany = await companyService.checkCompanyExists();
          
          console.log('Company exists:', hasCompany);
          setIsCompanySetupComplete(hasCompany);
          localStorage.setItem('company_setup_complete', hasCompany ? 'true' : 'false');
          
          if (!hasCompany) {
            console.log('Company not found, redirecting to setup...');
          }
        } catch (error) {
          console.error('Error checking company setup:', error);
          
          // If API fails in development, allow access for testing
          if (import.meta.env.DEV) {
            console.warn('API error in development, allowing access for testing');
            setIsCompanySetupComplete(true);
            localStorage.setItem('company_setup_complete', 'true');
          } else {
            // In production, if API fails, assume no company setup
            setIsCompanySetupComplete(false);
            localStorage.setItem('company_setup_complete', 'false');
          }
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
        <Route index element={
          isAuthenticated === true ? <Navigate to="/app" replace /> : 
          isAuthenticated === false ? <TenantLogin /> : 
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Kontrol ediliyor..." />
          </div>
        } />
        <Route path="login" element={
          isAuthenticated === true ? <Navigate to="/app" replace /> : <TenantLogin />
        } />
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