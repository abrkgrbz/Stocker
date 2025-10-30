/**
 * Role-based access control hook for Stocker Next.js
 * Provides easy access to user role information and permissions
 */

import { useAuth } from '@/lib/auth/auth-context';
import {
  isAdmin,
  isManager,
  hasPermission,
  getRolePermissions,
  getRoleDisplayName,
  getRoleBadgeColor,
  type RolePermissions
} from '@/lib/utils/roles';

export function useRole() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    // Raw role value
    role,

    // Role checks
    isAdmin: isAdmin(role),
    isManager: isManager(role),

    // Full permissions object
    permissions: getRolePermissions(role),

    // Check specific permission
    hasPermission: (permission: keyof RolePermissions) => hasPermission(role, permission),

    // UI helpers
    displayName: getRoleDisplayName(role),
    badgeColor: getRoleBadgeColor(role),
  };
}
