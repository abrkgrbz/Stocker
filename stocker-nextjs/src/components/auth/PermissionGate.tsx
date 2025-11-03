/**
 * Permission-based rendering component
 * Shows/hides content based on user permissions
 */

'use client';

import { useRole } from '@/hooks/useRole';
import type { RolePermissions } from '@/lib/utils/roles';

interface PermissionGateProps {
  permission: keyof RolePermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useRole();

  if (!hasPermission(permission)) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}

// Convenience components for common permissions
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAdmin } = useRole();
  return isAdmin ? <>{children}</> : <>{fallback ?? null}</>;
}

export function ManagerOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isManager } = useRole();
  return isManager ? <>{children}</> : <>{fallback ?? null}</>;
}
