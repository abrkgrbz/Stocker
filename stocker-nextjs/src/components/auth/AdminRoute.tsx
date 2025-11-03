/**
 * Admin route protection component
 * Redirects non-admin users to unauthorized page
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRole } from '@/hooks/useRole';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminRoute({ children, fallback = null }: AdminRouteProps) {
  const { isAdmin, role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role && !isAdmin) {
      // User is authenticated but not admin
      router.push('/unauthorized');
    }
  }, [isAdmin, role, router]);

  // Show nothing while checking (prevents flash of admin content)
  if (!role) {
    return <>{fallback ?? null}</>;
  }

  // Show content only for admins
  if (!isAdmin) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
