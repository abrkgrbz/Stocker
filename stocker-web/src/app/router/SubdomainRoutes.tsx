import React, { useEffect, useState, Suspense } from 'react';
import { lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { PrivateRoute } from './PrivateRoute';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import companyService from '@/services/companyService';

const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup/ModernCompanySetup'));
const CompanyWizard = lazy(() => import('@/features/company/pages/CompanyWizard'));
const ModulesScreen = lazy(() => import('@/features/modules/pages/ModulesScreen/ModernModulesScreen'));

/**
 * Routes for subdomain access (e.g., tenant.stoocker.app)
 * Handles both public auth routes and private tenant routes
 */
export const SubdomainRoutes: React.FC = () => {
  const { isAuthenticated, user, isInitialized, initializeAuth } = useSecureAuthStore();
  const [isCompanySetupComplete, setIsCompanySetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize auth only if we're not on a login page
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/' || currentPath === '/login' || currentPath === '/forgot-password';
    
    if (!isInitialized && !isLoginPage) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    // Check if company setup is complete
    const checkCompanySetup = async () => {
      // Wait for auth to be initialized
      if (!isInitialized) {
        // Auth not initialized yet, waiting...
        return;
      }
      
      // Only check if user is authenticated
      if (isAuthenticated === true) {
        // Start with null to show loading
        setIsCompanySetupComplete(null);
        
        // Add a small delay to ensure token is in localStorage
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Check localStorage first for quick initial state
          const localCompanySetup = localStorage.getItem('company_setup_complete');
          
          // Then verify with actual API
          // Checking company setup status from API...
          const hasCompany = await companyService.checkCompanyExists();
          
          // Company exists: hasCompany
          setIsCompanySetupComplete(hasCompany);
          localStorage.setItem('company_setup_complete', hasCompany ? 'true' : 'false');
          
          if (!hasCompany) {
            // Company not found, user needs to complete setup
          }
        } catch (error) {
          // Error checking company setup: error
          
          // Check localStorage as fallback
          const localCompanySetup = localStorage.getItem('company_setup_complete');
          
          if (localCompanySetup === 'true') {
            // Trust localStorage if it says setup is complete
            setIsCompanySetupComplete(true);
          } else if (import.meta.env.DEV) {
            // In development, allow access for testing
            // API error in development, allowing access for testing
            setIsCompanySetupComplete(true);
            localStorage.setItem('company_setup_complete', 'true');
          } else {
            // In production, if API fails and no localStorage, assume no company
            setIsCompanySetupComplete(false);
            localStorage.setItem('company_setup_complete', 'false');
          }
        }
      } else if (isAuthenticated === false) {
        // If not authenticated, set to false
        setIsCompanySetupComplete(false);
      }
      // If isAuthenticated is null (still loading), don't do anything
    };

    checkCompanySetup();
  }, [isAuthenticated, isInitialized]); // Depend on both isAuthenticated and isInitialized

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={
          isAuthenticated === true ? <Navigate to="/app" replace /> : 
          <TenantLogin />
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