import React, { useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { useTenant } from '@/contexts/TenantContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageLoader } from '@/shared/components/PageLoader';

import { SubdomainRoutes } from './SubdomainRoutes';

// Landing pages
const ModernLanding = lazy(() => import('@/features/landing/pages/ModernLanding').then(m => ({ default: m.ModernLanding })));
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then(m => ({ default: m.LandingPage })));

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));

// Register pages
const RegisterPage = lazy(() => import('@/features/register/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const RegisterWizard = lazy(() => import('@/features/register/pages/RegisterWizard'));

// Public pages
const TrainingPage = lazy(() => import('@/features/training/pages/TrainingPage').then(m => ({ default: m.TrainingPage })));
const BlogPage = lazy(() => import('@/features/blog/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const PricingPage = lazy(() => import('@/features/pricing/pages/PricingPage').then(m => ({ default: m.PricingPage })));

// Company setup
const CompanySetup = lazy(() => import('@/features/company/pages/CompanySetup'));
const CompanyWizard = lazy(() => import('@/features/company/pages/CompanyWizard'));

// Error pages
const NotFoundPage = lazy(() => import('@/features/error/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Test pages removed during refactoring

export const AppRouter: React.FC = () => {
  const { isSubdomain, tenantSlug, isValidTenant } = useTenant();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('AppRouter Debug:', {
        isSubdomain,
        tenantSlug,
        isValidTenant
      });
    }
  }, [isSubdomain, tenantSlug, isValidTenant]);

  // If we're on a subdomain and validation is still checking
  if (isSubdomain && isValidTenant === null) {
    return <PageLoader />;
  }

  // If we're on a subdomain, use subdomain routes
  if (isSubdomain) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SubdomainRoutes />
      </Suspense>
    );
  }

  // Main domain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          {/* Landing page */}
          <Route path="/" element={<ModernLanding />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Register routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-wizard" element={<RegisterWizard />} />
          
          {/* Public pages */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/training" element={<TrainingPage />} />
          
          {/* Company setup */}
          <Route path="/company-setup" element={<CompanySetup />} />
          <Route path="/company-wizard" element={<CompanyWizard />} />
        </Route>
        
        {/* Test routes removed during refactoring */}
        
        {/* Error pages */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};