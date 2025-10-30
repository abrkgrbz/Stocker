/**
 * Role-based access control utilities for Stocker Next.js
 *
 * Supports both built-in system roles and custom dynamic roles.
 *
 * System Roles (Default):
 * - FirmaYöneticisi: Company Manager (Admin privileges)
 * - Yönetici: Manager
 * - Kullanıcı: Regular User
 *
 * Custom Roles:
 * Created by admins with specific permissions assigned from backend.
 */

export enum UserRole {
  FirmaYoneticisi = 'FirmaYöneticisi',
  Yonetici = 'Yönetici',
  Kullanici = 'Kullanıcı',
  User = 'User', // Fallback for English role names
}

/**
 * Custom role with backend-defined permissions
 */
export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Format: "resource:permissionType"
  isSystemRole: boolean;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageTenantSettings: boolean;
  canManageModules: boolean;
  canViewAllData: boolean;
  canManageIntegrations: boolean;
  canManageBilling: boolean;
  canManageSecurity: boolean;
  canManageRoles: boolean;
  canDeleteData: boolean;
  canExportData: boolean;
}

/**
 * Check if a role has admin privileges
 * FirmaYöneticisi (Company Manager) is considered admin
 */
export function isAdmin(role: string | undefined): boolean {
  if (!role) return false;
  return role === UserRole.FirmaYoneticisi || role.toLowerCase() === 'firmayöneticisi';
}

/**
 * Check if a role has manager privileges
 * Both FirmaYöneticisi and Yönetici are managers
 */
export function isManager(role: string | undefined): boolean {
  if (!role) return false;
  return (
    isAdmin(role) ||
    role === UserRole.Yonetici ||
    role.toLowerCase() === 'yönetici'
  );
}

/**
 * Get permissions based on role
 * Supports both system roles and custom roles with backend-defined permissions
 */
export function getRolePermissions(
  role: string | undefined,
  customRole?: CustomRole
): RolePermissions {
  // If custom role provided with permissions, derive from backend permissions
  if (customRole && customRole.permissions.length > 0) {
    return derivePermissionsFromCustomRole(customRole);
  }

  // System role fallback
  if (isAdmin(role)) {
    // FirmaYöneticisi (Admin) has all permissions
    return {
      canManageUsers: true,
      canManageTenantSettings: true,
      canManageModules: true,
      canViewAllData: true,
      canManageIntegrations: true,
      canManageBilling: true,
      canManageSecurity: true,
      canManageRoles: true,
      canDeleteData: true,
      canExportData: true,
    };
  }

  if (isManager(role)) {
    // Yönetici (Manager) has limited admin permissions
    return {
      canManageUsers: false, // Cannot manage users
      canManageTenantSettings: false, // Cannot change tenant settings
      canManageModules: false, // Cannot enable/disable modules
      canViewAllData: true,
      canManageIntegrations: true,
      canManageBilling: false, // Cannot manage billing
      canManageSecurity: false, // Cannot manage security settings
      canManageRoles: false, // Cannot change roles
      canDeleteData: false, // Cannot delete critical data
      canExportData: true,
    };
  }

  // Kullanıcı (Regular User) has basic permissions
  return {
    canManageUsers: false,
    canManageTenantSettings: false,
    canManageModules: false,
    canViewAllData: false, // Only own data
    canManageIntegrations: false,
    canManageBilling: false,
    canManageSecurity: false,
    canManageRoles: false,
    canDeleteData: false,
    canExportData: false,
  };
}

/**
 * Derive RolePermissions from custom role's backend permissions
 * Maps backend permissions (resource:permissionType) to frontend permission flags
 */
function derivePermissionsFromCustomRole(customRole: CustomRole): RolePermissions {
  const permissions: RolePermissions = {
    canManageUsers: false,
    canManageTenantSettings: false,
    canManageModules: false,
    canViewAllData: false,
    canManageIntegrations: false,
    canManageBilling: false,
    canManageSecurity: false,
    canManageRoles: false,
    canDeleteData: false,
    canExportData: false,
  };

  // Map backend permissions to frontend permission flags
  customRole.permissions.forEach((perm) => {
    const [resource, permType] = perm.split(':');
    const permTypeNum = parseInt(permType, 10);

    // Users resource
    if (resource === 'Users') {
      if (permTypeNum >= 1) permissions.canManageUsers = true; // Create or higher
    }

    // Roles resource
    if (resource === 'Roles') {
      if (permTypeNum >= 1) permissions.canManageRoles = true; // Create or higher
    }

    // Settings resource
    if (resource === 'Settings') {
      if (permTypeNum >= 1) permissions.canManageTenantSettings = true;
    }

    // Modules resource
    if (resource === 'Modules') {
      if (permTypeNum >= 1) permissions.canManageModules = true;
    }

    // Integrations resource
    if (resource === 'Integrations') {
      if (permTypeNum >= 1) permissions.canManageIntegrations = true;
    }

    // Billing resource
    if (resource === 'Billing') {
      if (permTypeNum >= 0) permissions.canManageBilling = true; // View or higher
    }

    // Security resource
    if (resource === 'Security') {
      if (permTypeNum >= 1) permissions.canManageSecurity = true;
    }

    // Export permission (PermissionType.Export = 4)
    if (permTypeNum === 4) {
      permissions.canExportData = true;
    }

    // Delete permission (PermissionType.Delete = 3)
    if (permTypeNum === 3) {
      permissions.canDeleteData = true;
    }

    // View all data if has view on any major resource
    if (
      permTypeNum === 0 &&
      (resource.startsWith('CRM.') || ['Users', 'Reports', 'Audit'].includes(resource))
    ) {
      permissions.canViewAllData = true;
    }
  });

  return permissions;
}

/**
 * Check if user has a specific permission
 * Supports custom roles
 */
export function hasPermission(
  role: string | undefined,
  permission: keyof RolePermissions,
  customRole?: CustomRole
): boolean {
  const permissions = getRolePermissions(role, customRole);
  return permissions[permission];
}

/**
 * Get role display name in Turkish
 */
export function getRoleDisplayName(role: string | undefined): string {
  if (!role) return 'Bilinmiyor';

  const roleMap: Record<string, string> = {
    [UserRole.FirmaYoneticisi]: 'Firma Yöneticisi (Admin)',
    'firmayöneticisi': 'Firma Yöneticisi (Admin)',
    [UserRole.Yonetici]: 'Yönetici',
    'yönetici': 'Yönetici',
    [UserRole.Kullanici]: 'Kullanıcı',
    'kullanıcı': 'Kullanıcı',
    [UserRole.User]: 'Kullanıcı',
    'user': 'Kullanıcı',
  };

  return roleMap[role] || roleMap[role.toLowerCase()] || role;
}

/**
 * Get role badge color for UI display
 */
export function getRoleBadgeColor(role: string | undefined): string {
  if (isAdmin(role)) return 'red'; // Admin - Red badge
  if (isManager(role)) return 'blue'; // Manager - Blue badge
  return 'default'; // User - Default badge
}
