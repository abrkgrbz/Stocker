import React from 'react';
import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicLayout } from '@/layouts/PublicLayout';

const TenantLogin = lazy(() => import('@/features/auth/pages/TenantLogin').then(m => ({ default: m.TenantLogin })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const EmailVerificationPage = lazy(() => import('@/features/auth/pages/EmailVerification'));

/**
 * Routes for subdomain access (e.g., tenant.stoocker.app)
 * Only login and auth-related routes for now
 * Post-login features will be added after refactoring
 */
export const SubdomainRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<TenantLogin />} />
        <Route path="login" element={<TenantLogin />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="verify-email" element={<EmailVerificationPage />} />
      </Route>

      {/* Redirect all other routes to login for now */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};