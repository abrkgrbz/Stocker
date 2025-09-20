import { useMemo } from 'react';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';

export type Permission = 
  | 'view_dashboard'
  | 'manage_tenants'
  | 'manage_users'
  | 'manage_packages'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_billing'
  | 'manage_modules'
  | 'view_analytics'
  | 'manage_migrations'
  | 'system_admin';

interface RolePermissions {
  [role: string]: Permission[];
}

const rolePermissions: RolePermissions = {
  SystemAdmin: [
    'view_dashboard',
    'manage_tenants',
    'manage_users',
    'manage_packages',
    'view_reports',
    'manage_settings',
    'manage_billing',
    'manage_modules',
    'view_analytics',
    'manage_migrations',
    'system_admin',
  ],
  TenantAdmin: [
    'view_dashboard',
    'manage_users',
    'view_reports',
    'manage_settings',
    'manage_billing',
    'manage_modules',
    'view_analytics',
  ],
  Admin: [
    'view_dashboard',
    'manage_users',
    'view_reports',
    'manage_settings',
    'view_analytics',
  ],
  User: [
    'view_dashboard',
    'view_reports',
  ],
};

export function usePermissions() {
  const { user } = useSecureAuthStore();

  const permissions = useMemo(() => {
    if (!user?.roles) return [];

    const allPermissions = new Set<Permission>();
    
    user.roles.forEach(role => {
      const perms = rolePermissions[role] || [];
      perms.forEach(perm => allPermissions.add(perm));
    });

    return Array.from(allPermissions);
  }, [user]);

  const hasPermission = useMemo(() => {
    return (permission: Permission | Permission[]): boolean => {
      if (Array.isArray(permission)) {
        return permission.some(p => permissions.includes(p));
      }
      return permissions.includes(permission);
    };
  }, [permissions]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(p => permissions.includes(p));
    };
  }, [permissions]);

  const hasRole = useMemo(() => {
    return (role: string | string[]): boolean => {
      if (!user?.roles) return false;
      
      if (Array.isArray(role)) {
        return role.some(r => user.roles?.includes(r));
      }
      return user.roles.includes(role);
    };
  }, [user]);

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasRole,
    isSystemAdmin: hasRole('SystemAdmin'),
    isTenantAdmin: hasRole('TenantAdmin'),
    isAdmin: hasRole(['Admin', 'TenantAdmin', 'SystemAdmin']),
  };
}