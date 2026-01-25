'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/primitives';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required permission to access this route
   * Format: "Resource:PermissionType" (e.g., "CRM.Customers:View")
   */
  permission?: string;
  /**
   * Multiple permissions - user needs ANY of these
   * Format: ["Resource:PermissionType", ...]
   */
  anyPermission?: string[];
  /**
   * Multiple permissions - user needs ALL of these
   * Format: ["Resource:PermissionType", ...]
   */
  allPermissions?: string[];
  /**
   * Custom fallback component when access is denied
   */
  fallback?: React.ReactNode;
  /**
   * Custom redirect path when access is denied
   * If not provided, shows access denied UI
   */
  redirectTo?: string;
}

/**
 * Route-level permission guard component.
 * Wraps page content and checks permissions before rendering.
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute permission="CRM.Customers:View">
 *   <CustomersPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  permission,
  anyPermission,
  allPermissions,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, hasPermission, hasAnyPermission } = useAuth();

  // Check for auth bypass in development
  // const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
  const isAuthBypassed = true; // Forced for local debugging

  // Show loading while auth state is being determined
  if (isLoading && !isAuthBypassed) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Auth bypass mode - allow everything
  if (isAuthBypassed) {
    return <>{children}</>;
  }

  // Check if user is admin (bypass all permission checks)
  const isAdmin = user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi');
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check permissions
  let hasAccess = true;

  if (permission) {
    // Single permission check
    const [resource, permType] = permission.split(':');
    hasAccess = hasPermission(resource, permType);
  } else if (anyPermission && anyPermission.length > 0) {
    // Any of the permissions
    hasAccess = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    // All permissions required
    hasAccess = allPermissions.every(p => {
      const [resource, permType] = p.split(':');
      return hasPermission(resource, permType);
    });
  }

  // Access granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - redirect if path provided
  if (redirectTo) {
    router.push(redirectTo);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Access denied - show fallback or default UI
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  return <AccessDenied />;
}

/**
 * Default Access Denied component
 */
function AccessDenied() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center p-8 bg-white rounded-lg max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldExclamationIcon className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Erişim Reddedildi
        </h2>
        <p className="text-gray-500 mb-6">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
          Yetkili olduğunuzu düşünüyorsanız sistem yöneticinizle iletişime geçin.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Geri Dön
          </Button>
          <Button
            type="primary"
            onClick={() => router.push('/app')}
            style={{ background: '#1a1a1a' }}
          >
            Ana Sayfaya Git
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * HOC version of ProtectedRoute for wrapping entire pages
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute permission={permission}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook to check if current user has permission
 * Useful for conditional rendering within components
 */
export function useRoutePermission(permission: string): {
  hasAccess: boolean;
  isLoading: boolean;
  isAdmin: boolean;
} {
  const { user, isLoading, hasPermission } = useAuth();
  const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

  if (isAuthBypassed) {
    return { hasAccess: true, isLoading: false, isAdmin: true };
  }

  const isAdmin = user?.roles?.includes('FirmaYoneticisi') || user?.roles?.includes('SistemYoneticisi');

  if (isAdmin) {
    return { hasAccess: true, isLoading, isAdmin: true };
  }

  const [resource, permType] = permission.split(':');
  const hasAccess = hasPermission(resource, permType);

  return { hasAccess, isLoading, isAdmin: false };
}

export default ProtectedRoute;
