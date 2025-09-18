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
        // First check localStorage for quick access
        const localCompanySetup = localStorage.getItem('company_setup_complete');
        
        // For now, default to true if authenticated (since API is down)
        // In production, this would check the actual API
        if (localCompanySetup === 'true') {
          setIsCompanySetupComplete(true);
        } else {
          // Set as true by default for development since API is not available
          console.log('API is not available, defaulting company setup to complete');
          localStorage.setItem('company_setup_complete', 'true');
          setIsCompanySetupComplete(true);
        }
        
        // Optionally try API but don't block on it
        try {
          const hasCompany = await companyService.checkCompanyExists();
          if (hasCompany !== null) {
            setIsCompanySetupComplete(hasCompany);
            localStorage.setItem('company_setup_complete', hasCompany ? 'true' : 'false');
          }
        } catch (error) {
          console.warn('Company API not available, using default:', error);
          // Keep the default value set above
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